import path from 'node:path';
import { toPosix, humanBytes } from './util.js';
import { locationLabel } from './search.js';

function kindLabel(kind) {
  return ({ docx: 'Word', doc: 'DOC', pdf: 'PDF', pptx: 'PPT', ppt: 'PPT', xlsx: 'Excel', text: '文本', name: '仅文件名' })[kind] ?? kind;
}

function extentText(entry) {
  if (!entry) return '';
  if (entry.kind === 'name') return '仅文件名';
  if ((entry.blocks ?? 0) === 0) return '无文本（可能是扫描件）';
  switch (entry.kind) {
    case 'docx':
      return `${entry.blocks ?? 0} 段`;
    case 'pdf':
    case 'doc':
    case 'ppt':
      return `${entry.extent?.pages ?? '?'} 页`;
    case 'pptx':
      return `${entry.extent?.slides ?? '?'} 张`;
    case 'xlsx':
      return `${entry.extent?.sheets?.length ?? '?'} 个工作表`;
    default:
      return `${entry.blocks ?? 0} 行`;
  }
}

export async function outlineLibrary(index, args = {}, settings = {}) {
  const sync =
    args.refresh === 'never'
      ? await index.stats()
      : await index.sync({
          force: args.refresh === 'force',
          budget: args.refresh === 'force' ? Number(index.config.forceBudget ?? 100) : Number(index.config.indexBudgetPerCall ?? 25),
        });
  const manifest = await index.loadManifest();
  const subpath = args.subpath ? toPosix(String(args.subpath)).replace(/^\.?\//, '').replace(/\/+$/, '') : '';
  const includeQuestions = args.includeQuestions !== false;
  const includeNames = args.includeNames === true;
  const maxFiles = Math.max(1, Math.min(Number(args.maxFiles ?? settings.outlineMaxFiles ?? 60), 200));

  const entries = Object.entries(manifest.files)
    .filter(([rel, entry]) => entry && !entry.err && (!subpath || rel === subpath || rel.startsWith(`${subpath}/`)))
    .sort(([a], [b]) => a.localeCompare(b));
  const docEntries = entries.filter(([, entry]) => entry.kind !== 'name');
  const nameEntries = entries.filter(([, entry]) => entry.kind === 'name');
  const visibleEntries = includeNames ? entries : docEntries;

  const folders = new Map();
  for (const [rel] of entries) {
    const top = rel.includes('/') ? rel.split('/')[0] : '（根目录）';
    folders.set(top, (folders.get(top) ?? 0) + 1);
  }
  const folderLine = [...folders.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, count]) => `${name}（${count}）`)
    .join(' · ');

  const lines = [];
  lines.push(`**库**：${index.root} · 文档 ${entries.length}`);
  lines.push(`**缓存**：${humanBytes(sync.cacheBytes ?? 0)}${sync.pending ? ` · 待索引 ${sync.pending}` : ''}`);
  if (folderLine) lines.push(`**目录**：${folderLine}`);

  const shown = visibleEntries.slice(0, maxFiles);
  const hiddenNames = includeNames ? 0 : nameEntries.length;
  shown.forEach(([rel, entry], i) => {
    lines.push(`${i + 1}. ${rel}（${kindLabel(entry.kind)}，${extentText(entry)}）`);
    const sections = Array.isArray(entry.sections) ? entry.sections.slice(0, 3) : [];
    if (sections.length) {
      lines.push(`   大题：${sections.map((section) => `${section.label} → ${locationLabel(section.loc)}`).join('；')}`);
    }
    if (includeQuestions) {
      const questions = Array.isArray(entry.questions) ? entry.questions.slice(0, 8) : [];
      if (questions.length) {
        const parts = questions.map((question) => `${question.no} ${locationLabel(question.loc)}`);
        const more = (entry.questions?.length ?? 0) - questions.length;
        lines.push(`   题号：${parts.join(' · ')}${more > 0 ? ` …另 ${more} 个` : ''}`);
      }
    }
  });
  const empty = entries.filter(([, entry]) => (entry.blocks ?? 0) === 0).length;
  if (empty) lines.push(`（${empty} 个文件没有可抽取的文本，可能是扫描件或空文档）`);
  if (hiddenNames) lines.push(`（另有 ${hiddenNames} 个仅文件名条目：压缩包/图片/视频等，加 includeNames=true 查看）`);
  if (visibleEntries.length > shown.length) lines.push(`（还有 ${visibleEntries.length - shown.length} 个文件未列出；用 subpath 缩小目录或提高 maxFiles）`);
  if (!entries.length) lines.push('（该目录下没有已索引的文档）');
  return {
    library: index.root,
    stats: { documents: entries.length, cacheBytes: sync.cacheBytes ?? 0, pending: sync.pending ?? 0 },
    folders: Object.fromEntries(folders),
    files: shown.map(([rel, entry]) => ({
      rel,
      kind: entry.kind,
      extent: entry.extent ?? null,
      sections: entry.sections ?? [],
      questions: (entry.questions ?? []).slice(0, 30),
    })),
    text: lines.join('\n'),
  };
}
