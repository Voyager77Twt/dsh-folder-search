import { humanBytes } from './util.js';
import { locationLabel, openTarget } from './search.js';

function orderOf(loc) {
  if (!loc || typeof loc !== 'object') return 0;
  switch (loc.k) {
    case 'docx':
      return Number(loc.p) || 0;
    case 'pdf':
      return Number(loc.page) || 0;
    case 'pptx':
      return Number(loc.slide) || 0;
    case 'xlsx':
      return 0;
    case 'text':
      return Number(loc.line) || 0;
    default:
      return 0;
  }
}

function matchesLocKind(a, b) {
  return a && b && a.k === b.k;
}

export async function readLibraryDocument(index, args, config = {}) {
  const doc = await index.docFor(String(args.path ?? ''));
  if (!doc) throw new Error(`文件不在已索引的库中：${args.path}`);
  if (doc.entry.err) throw new Error(`该文件没有被成功索引：${doc.entry.err}`);
  const blocks = await index.readDoc(doc.entry.id);
  const question = args.question == null ? null : String(args.question).replace(/^第|题$/g, '').trim();

  let from = -Infinity;
  let to = Infinity;
  let rangeNote = '';
  let startQuestion = null;
  let endQuestion = null;
  if (question) {
    const questions = Array.isArray(doc.entry.questions) ? doc.entry.questions : [];
    const indexAt = questions.findIndex((entry) => String(entry.no) === question);
    if (indexAt < 0) throw new Error(`文件里没有找到题号 ${question}`);
    startQuestion = questions[indexAt];
    const startOrder = orderOf(startQuestion.loc);
    endQuestion = questions.slice(indexAt + 1).find((entry) => matchesLocKind(entry.loc, startQuestion.loc)) ?? null;
    const endOrder = endQuestion ? orderOf(endQuestion.loc) : Infinity;
    from = startOrder;
    to = endOrder;
    rangeNote = `题号 ${question}`;
  } else if (args.from != null || args.to != null) {
    from = Number(args.from ?? 0) || 0;
    to = args.to == null ? Infinity : Number(args.to) || Infinity;
    rangeNote = `范围 ${from}–${to}`;
  }

  const selected = [];
  for (const block of blocks) {
    const order = orderOf(block.loc);
    if (order < from || order >= to) continue;
    let text = block.text;
    if (startQuestion && matchesLocKind(block.loc, startQuestion.loc) && order === orderOf(startQuestion.loc)) {
      text = text.slice(Number(startQuestion.at) || 0);
    }
    if (endQuestion && matchesLocKind(block.loc, endQuestion.loc) && order === orderOf(endQuestion.loc)) {
      text = text.slice(0, Number(endQuestion.at) || text.length);
    }
    if (!text.trim()) continue;
    selected.push({ loc: block.loc, text });
  }
  const maxChars = Math.max(500, Math.min(Number(args.maxChars ?? 12000), 60000));
  const out = [];
  let used = 0;
  let truncated = false;
  for (const block of selected) {
    const label = locationLabel(block.loc);
    const text = block.text;
    if (used + text.length > maxChars) {
      const remain = maxChars - used;
      if (remain > 100) out.push({ label, text: `${text.slice(0, remain)}…` });
      truncated = true;
      break;
    }
    out.push({ label, text });
    used += text.length;
  }

  return {
    file: doc.absPath,
    rel: doc.rel,
    kind: doc.entry.kind,
    range: rangeNote || null,
    blocks: out,
    chars: used,
    truncated,
    cache: humanBytes(doc.entry.size ?? 0),
  };
}

export function renderReadResult(result) {
  const lines = [];
  lines.push(`**文件**：${result.file}（${result.kind}）${result.range ? ` · ${result.range}` : ''}`);
  if (!result.blocks.length) lines.push('（没有可读取的内容）');
  for (const block of result.blocks) {
    lines.push(`【${block.label}】`);
    lines.push(block.text);
  }
  if (result.truncated) lines.push(`（已截断，累计 ${result.chars} 字符；用 question 或 maxChars 缩小范围）`);
  return lines.join('\n');
}

export { openTarget };
