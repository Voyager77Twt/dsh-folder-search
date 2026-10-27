import { spawn } from 'node:child_process';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { collapse, humanBytes, resolveRg, toPosix, sha1 } from './util.js';

const MAX_RG_LINES = 50000;

export function normalizeKeywords(input) {
  const list = Array.isArray(input) ? input : [input];
  const out = [];
  for (const raw of list) {
    if (typeof raw !== 'string') continue;
    for (const piece of raw.split(/[,，;；\n]+/)) {
      const term = piece.trim();
      if (term) out.push(term);
    }
  }
  return [...new Set(out)].slice(0, 12);
}

/** Expand each keyword with a configured association list (e.g. 有机 -> 烃/醇/醛). */
export function expandTerms(keywords, associations = {}, enabled = true, limit = 8, customAssociations = {}) {
  const map = new Map();
  const keys = Object.entries(associations || {});
  for (const keyword of keywords) {
    if (!enabled) {
      map.set(keyword, [keyword]);
      continue;
    }
    const terms = new Set([keyword]);
    const customValues = Array.isArray(customAssociations[keyword]) ? customAssociations[keyword] : [];
    const builtinValues = Array.isArray(associations[keyword]) ? associations[keyword] : [];
    const merged = [...new Set([...customValues, ...builtinValues])];
    for (const value of merged.slice(0, limit + 1)) terms.add(value);
    for (const [key, values] of keys) {
      if (keyword.includes(key) || key.includes(keyword)) {
        for (const value of values) if (typeof value === 'string' && value.trim()) terms.add(value.trim());
      }
    }
    map.set(keyword, [...terms].slice(0, Math.max(1, Math.min(8, limit + 1))));
  }
  const all = [...new Set([...map.values()].flat())].slice(0, 48);
  return { map, all };
}

function locationKey(loc) {
  return JSON.stringify(loc);
}

function parseCacheLine(line) {
  const tab = line.indexOf('\t');
  if (tab < 0) return null;
  try {
    return { loc: JSON.parse(line.slice(0, tab)), text: JSON.parse(line.slice(tab + 1)) };
  } catch {
    return null;
  }
}

async function scanWithRg(index, terms, options = {}) {
  const rg = resolveRg(index.config);
  const args = ['--json', '--no-config', '--fixed-strings', '--max-count', '2000', '--glob', '*.txt'];
  if (!options.caseSensitive) args.push('-i');
  for (const term of terms) args.push('-e', term);
  args.push('.');

  return new Promise((resolve, reject) => {
    let child;
    try {
      child = spawn(rg, args, { cwd: index.docsDir, windowsHide: true });
    } catch (error) {
      reject(error);
      return;
    }
    let buffer = '';
    let lines = 0;
    let truncated = false;
    const hits = new Map();
    const onLine = (raw) => {
      if (!raw.trim()) return;
      lines += 1;
      if (lines > MAX_RG_LINES) { truncated = true; return; }
      let event;
      try {
        event = JSON.parse(raw);
      } catch {
        return;
      }
      if (event.type !== 'match') return;
      const filePath = event.data?.path?.text;
      const lineText = event.data?.lines?.text;
      if (!filePath || !lineText) return;
      const id = path.basename(filePath).replace(/\.txt$/i, '');
      const parsed = parseCacheLine(lineText.replace(/\r?\n$/, ''));
      if (!parsed) return;
      if (!hits.has(id)) hits.set(id, new Map());
      hits.get(id).set(locationKey(parsed.loc), parsed);
    };
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      buffer += chunk;
      let newline = buffer.indexOf('\n');
      while (newline >= 0) {
        onLine(buffer.slice(0, newline));
        buffer = buffer.slice(newline + 1);
        newline = buffer.indexOf('\n');
      }
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (buffer) onLine(buffer);
      if (code === 0 || code === 1) resolve({ hits, engine: 'ripgrep', truncated });
      else resolve({ hits, engine: 'ripgrep', warning: `rg 退出码 ${code}`, truncated });
    });
  });
}

async function scanWithJs(index, terms, options = {}) {
  const hits = new Map();
  let names = [];
  try {
    names = await fsp.readdir(index.docsDir);
  } catch {
    return { hits, engine: 'js' };
  }
  const needles = terms.map((term) => (options.caseSensitive ? term : term.toLowerCase()));
  for (const name of names) {
    if (!name.endsWith('.txt')) continue;
    const id = name.slice(0, -4);
    let text = '';
    try {
      text = await fsp.readFile(path.join(index.docsDir, name), 'utf8');
    } catch {
      continue;
    }
    for (const line of text.split('\n')) {
      const parsed = parseCacheLine(line);
      if (!parsed) continue;
      const haystack = options.caseSensitive ? parsed.text : parsed.text.toLowerCase();
      if (!needles.some((needle) => haystack.includes(needle))) continue;
      if (!hits.has(id)) hits.set(id, new Map());
      hits.get(id).set(locationKey(parsed.loc), parsed);
    }
  }
  return { hits, engine: 'js' };
}

function snippetAround(text, terms, chars = 60) {
  const flat = collapse(text);
  if (!flat) return '';
  let index = -1;
  let length = 0;
  const lower = flat.toLowerCase();
  for (const term of terms) {
    const at = lower.indexOf(String(term).toLowerCase());
    if (at >= 0 && (index < 0 || at < index)) {
      index = at;
      length = String(term).length;
    }
  }
  if (index < 0) return flat.slice(0, chars) + (flat.length > chars ? '…' : '');
  const start = Math.max(0, index - Math.floor((chars - length) / 2));
  const end = Math.min(flat.length, start + chars);
  let out = flat.slice(start, end);
  if (start > 0) out = `…${out}`;
  if (end < flat.length) out = `${out}…`;
  return out;
}

export function locationLabel(loc) {
  if (!loc || typeof loc !== 'object') return '未知位置';
  switch (loc.k) {
    case 'docx':
      return `第 ${loc.p} 段${loc.h ? `（${loc.h}）` : ''}`;
    case 'pdf':
      return `第 ${loc.page} 页`;
    case 'pptx':
      return `第 ${loc.slide} 张幻灯片`;
    case 'xlsx':
      return `${loc.sheet}!${loc.cell}`;
    case 'text':
      return `第 ${loc.line} 行`;
    case 'name':
      return '文件名';
    default:
      return JSON.stringify(loc);
  }
}

export function openTarget(absPath /*, loc, kind */) {
  // 始终返回可直接打开的绝对路径：带 #page 片段会让资源管理器/Word 打不开文件。
  return absPath;
}

function kindLabel(kind) {
  return ({ docx: 'Word', doc: 'DOC', pdf: 'PDF', pptx: 'PPT', ppt: 'PPT', xlsx: 'Excel', text: '文本', name: '仅文件名' })[kind] ?? kind;
}

function matchOffset(text, terms, caseSensitive) {
  const hay = caseSensitive ? text : text.toLowerCase();
  let best = -1;
  for (const term of terms) {
    const at = hay.indexOf(caseSensitive ? term : term.toLowerCase());
    if (at >= 0 && (best < 0 || at < best)) best = at;
  }
  return best;
}

function nearestQuestion(entry, loc, offset) {
  const questions = Array.isArray(entry?.questions) ? entry.questions : [];
  const orderOf = (question) => (loc.k === 'docx' ? question.loc.p : loc.k === 'pdf' ? question.loc.page : question.loc.slide);
  let best = null;
  for (const question of questions) {
    if (!question?.loc || question.loc.k !== loc.k) continue;
    const at = Number(question.at ?? 0);
    let before = false;
    if (loc.k === 'docx') before = question.loc.p < loc.p || (question.loc.p === loc.p && at <= offset);
    else if (loc.k === 'pdf') before = question.loc.page === loc.page && at <= offset;
    else if (loc.k === 'pptx') before = question.loc.slide === loc.slide && at <= offset;
    if (!before) continue;
    if (!best) { best = question; continue; }
    const delta = orderOf(question) - orderOf(best);
    if (delta > 0 || (delta === 0 && at >= Number(best.at ?? 0))) best = question;
  }
  return best;
}

function markdownLink(label, target) {
  return `[${label}](<${target}>)`;
}


function renderHit(absPath, name, loc, kind) {
  const label = locationLabel(loc);
  return markdownLink(label, openTarget(absPath, loc, kind));
}

async function searchOnce(index, args, config = {}, settings = {}) {
  let keywords = normalizeKeywords(args.keywords);
  if (!keywords.length) throw new Error('keywords 不能为空');
  const match = args.match === 'all' ? 'all' : 'any';
  const matchScope = settings.matchScope === 'block' ? 'block' : 'file';
  const caseSensitive = args.caseSensitive === true;
  const expand = settings.expand !== false;
  const refresh = args.refresh === 'force' ? 'force' : args.refresh === 'never' || settings.syncBeforeSearch === false ? 'never' : 'auto';

  let sync = null;
  if (refresh !== 'never') {
    sync = await index.sync({
      force: refresh === 'force',
      budget: refresh === 'force' ? Number(config.forceBudget ?? 300) : Number(config.indexBudgetPerCall ?? 25),
    });
  } else {
    sync = await index.stats().then((stats) => ({
      root: stats.root,
      documents: stats.documents,
      ready: stats.ready,
      pending: 0,
      changed: 0,
      cacheBytes: stats.cacheBytes,
      capReached: false,
      partial: false,
      errors: [],
      libraryBytes: 0,
    }));
  }

  // keywords 只保留用户原词：模型若把同一个词同时放进 strong/general，先从 keywords 去重。
  const strongTerms = settings.enableStrong === false ? [] : (Array.isArray(args.strongTerms) ? args.strongTerms : []).map((term) => String(term).trim()).filter(Boolean).slice(0, Number(settings.strongLimit ?? 1));
  const generalTerms = settings.enableGeneral === false ? [] : (Array.isArray(args.generalTerms) ? args.generalTerms : []).map((term) => String(term).trim()).filter(Boolean).slice(0, Number(settings.associationLimit ?? 4));
  const excluded = new Set([...strongTerms, ...generalTerms]);
  const keptKeywords = keywords.filter((term) => !excluded.has(term));
  if (keptKeywords.length) keywords = keptKeywords;
  const { map: expansion, all: terms } = expandTerms(keywords, config.associations, expand, settings.associationLimit ?? 4, settings.customAssociations || {});
  const extraTerms = [...strongTerms, ...generalTerms];
  for (const term of extraTerms) if (!terms.includes(term)) terms.push(term);
  if (!terms.length) throw new Error('扩展后没有可搜索的词');

  let scan;
  try {
    scan = await scanWithRg(index, terms, { caseSensitive });
    if (!scan.hits.size && scan.warning) scan = await scanWithJs(index, terms, { caseSensitive });
  } catch {
    scan = await scanWithJs(index, terms, { caseSensitive });
  }

  const manifest = await index.loadManifest();
  const byId = new Map();
  for (const [rel, entry] of Object.entries(manifest.files)) {
    if (entry?.id) byId.set(entry.id, { rel, entry });
  }

  const subpath = args.subpath ? toPosix(String(args.subpath)).replace(/^\.?\//, '').replace(/\/+$/, '') : null;
  const normalMax = settings.normalMaxFiles ?? config.maxFiles ?? 'all';
  const assocMax = settings.expandMaxFiles ?? config.expandMaxFiles ?? 8;
  const normalLimit = normalMax === 'all' ? Infinity : Math.max(1, Math.min(Number(normalMax), 5000));
  const assocLimit = assocMax === 'all' ? Infinity : Math.max(1, Math.min(Number(assocMax), 5000));
  const normalBlocks = Math.max(1, Math.min(Number(settings.normalMaxBlocksPerFile ?? config.maxBlocksPerFile ?? 4), 50));
  const assocBlocks = Math.max(1, Math.min(Number(settings.expandMaxBlocksPerFile ?? config.expandMaxBlocksPerFile ?? 2), 50));
  const normalSnippet = Math.max(20, Number(settings.normalSnippetChars ?? config.snippetChars ?? 90));
  const assocSnippet = Math.max(20, Number(settings.expandSnippetChars ?? config.expandSnippetChars ?? 45));
  const strongMax = settings.strongMaxFiles ?? 'all';
  const strongLimit = strongMax === 'all' ? Infinity : Math.max(1, Math.min(Number(strongMax), 5000));
  const strongBlocks = Math.max(1, Math.min(Number(settings.strongMaxBlocksPerFile ?? 2), 50));
  const strongSnippet = Math.max(20, Number(settings.strongSnippetChars ?? 45));
  const snippetChars = Math.max(normalSnippet, assocSnippet, strongSnippet);
  const dedupe = settings.dedupe === true || config.dedupe === true;

  let fileResults = [];
  let totalFilesHit = 0;
  let totalBlocksHit = 0;

  for (const [id, blockMap] of scan.hits) {
    const doc = byId.get(id);
    if (!doc) continue;
    if (subpath && !doc.rel.startsWith(subpath === '' ? '' : `${subpath}/`) && doc.rel !== subpath) continue;
    const blocks = [];
    const fileKeywords = new Set();
    const fileDirectKeywords = new Set();
    const fileExpandedKeywords = new Set();
    const fileStrong = new Set();
    const fileGeneral = new Set();
    for (const { loc, text } of blockMap.values()) {
      const lower = caseSensitive ? text : text.toLowerCase();
      const matched = [];
      for (const keyword of keywords) {
        const variants = expansion.get(keyword) ?? [keyword];
        const original = caseSensitive ? keyword : keyword.toLowerCase();
        const foundOriginal = lower.includes(original);
        const foundVariant = variants.some((variant) => {
          const needle = caseSensitive ? variant : variant.toLowerCase();
          return lower.includes(needle);
        });
        if (foundVariant) {
          matched.push(keyword);
          if (foundOriginal) fileDirectKeywords.add(keyword);
          else fileExpandedKeywords.add(keyword);
        }
      }
      const strongMatched = strongTerms.filter((term) => (caseSensitive ? text : text.toLowerCase()).includes(caseSensitive ? term : term.toLowerCase()));
      const generalMatched = generalTerms.filter((term) => (caseSensitive ? text : text.toLowerCase()).includes(caseSensitive ? term : term.toLowerCase()));
      const extraMatched = [...strongMatched, ...generalMatched];
      if (!matched.length && !extraMatched.length) continue;
      totalBlocksHit += 1;
      for (const keyword of matched) fileKeywords.add(keyword);
      for (const term of strongMatched) fileStrong.add(term);
      for (const term of generalMatched) fileGeneral.add(term);
      const offset = matchOffset(text, terms, caseSensitive);
      const question = nearestQuestion(doc.entry, loc, offset < 0 ? 0 : offset);
      const baseLabel = locationLabel(loc);
      blocks.push({
        loc,
        label: (settings.includeQuestionNumbers === false ? baseLabel : question ? `${baseLabel} · 题号 ${question.no}（文中编号）` : baseLabel) + (extraMatched.length ? ' · 关联词 ' + extraMatched.join('、') : ''),
        question: question?.no ?? null,
        snippet: settings.includeSnippets === false ? '' : snippetAround(text, terms.filter((term) => (caseSensitive ? text : text.toLowerCase()).includes(caseSensitive ? term : term.toLowerCase())), snippetChars),
        hash: sha1(text),
        keywords: matched,
        related: extraMatched,
        open: openTarget(path.join(index.root, doc.rel), loc, doc.entry.kind),
      });
    }
    if (matchScope === 'block') {
      const keep = blocks.filter((block) => (match === 'all' ? block.keywords.length === keywords.length : block.keywords.length > 0 || (fileKeywords.size === 0 && fileStrong.size === 0 && (block.related?.length ?? 0) > 0)));
      blocks.length = 0;
      blocks.push(...keep);
    }
    const covered = match === 'all' ? fileKeywords.size === keywords.length : fileKeywords.size > 0 || fileStrong.size > 0;
    const generalCandidate = fileKeywords.size === 0 && fileStrong.size === 0 && fileGeneral.size > 0;
    if (matchScope === 'block') {
      if (!blocks.length) continue;
    } else if (!covered && !generalCandidate) {
      continue;
    }
    totalFilesHit += 1;
    const directFile = fileDirectKeywords.size > 0;
    const expandedFile = !directFile && fileKeywords.size > 0;
    const generalFile = !directFile && !expandedFile && fileGeneral.size > 0;
    const blockCap = directFile ? normalBlocks : expandedFile ? assocBlocks : generalFile ? assocBlocks : strongBlocks;
    const snippetCap = directFile ? normalSnippet : expandedFile ? assocSnippet : generalFile ? assocSnippet : strongSnippet;
    const sortedBlocks = blocks.slice(0, blockCap);
    if (!directFile) for (const block of sortedBlocks) block.snippet = block.snippet.length > snippetCap ? block.snippet.slice(0, snippetCap) + '…' : block.snippet;
    fileResults.push({
      path: path.join(index.root, doc.rel),
      rel: doc.rel,
      name: path.basename(doc.rel),
      kind: doc.entry.kind,
      keywords: [...fileKeywords],
      directKeywords: [...fileDirectKeywords],
      expandedKeywords: [...fileExpandedKeywords],
      expandedOnly: expandedFile,
      generalOnly: generalFile,
      related: [...fileStrong, ...fileGeneral],
      strongTerms: [...fileStrong],
      generalTerms: [...fileGeneral],
      relatedOnly: !generalFile && fileKeywords.size === 0 && fileStrong.size > 0,
      blocks: sortedBlocks,
      blocksHit: blocks.length,
    });
  }

  let strongGate = null;
  if (strongTerms.length) {
    const directFiles = fileResults.filter((file) => (file.directKeywords?.length ?? 0) > 0).length;
    const totalDocs = Object.keys(manifest.files || {}).length || 1;
    const counts = new Map();
    for (const file of fileResults) for (const term of file.strongTerms) counts.set(term, (counts.get(term) || 0) + 1);
    const ranked = [...counts.entries()].sort((a, b) => a[1] - b[1]);
    const domainWord = /(工业|产业|行业|领域|技术|方法|工艺|生产|应用|研究|化学|反应|原理|实验|流程|装置|设备|材料|物质|题目|试题)$/;
    const mode = settings.strongGateMode || 'all';
    const maxFiles = Number(settings.strongGateFiles ?? 50);
    const maxRatio = Number(settings.strongGateRatio ?? 20);
    const factor = Math.max(1, Number(settings.strongGateFactor ?? 2));
    const gateActive = directFiles > 5;
    const isBroad = (term, count) => {
      const overFactor = gateActive && count > directFiles * factor;
      const overFiles = count > maxFiles;
      const overRatio = gateActive && (count / totalDocs) * 100 > maxRatio;
      const domain = domainWord.test(term);
      if (mode === 'factor') return overFactor;
      if (mode === 'files') return overFiles;
      if (mode === 'ratio') return overRatio;
      if (mode === 'domain') return domain;
      return overFactor || overRatio || domain;
    };
    const kept = ranked.find(([term, count]) => !isBroad(term, count)) || null;
    const keptTerm = kept ? kept[0] : null;
    const demoted = ranked.filter(([term]) => term !== keptTerm).map(([term]) => term);
    if (demoted.length) {
      const filtered = [];
      for (const file of fileResults) {
        const strong = file.strongTerms.filter((term) => term === keptTerm);
        if (!file.keywords.length && !strong.length && !file.generalOnly) continue;
        file.related = [...strong, ...file.generalTerms];
        file.relatedOnly = file.keywords.length === 0 && strong.length > 0;
        file.blocks = file.blocks.filter((block) => block.keywords.length > 0 || block.related.some((term) => strong.includes(term) || file.generalTerms.includes(term)));
        if (!file.blocks.length) continue;
        file.blocksHit = file.blocks.length;
        filtered.push(file);
      }
      fileResults = filtered;
      totalFilesHit = filtered.length;
      totalBlocksHit = filtered.reduce((sum, file) => sum + file.blocksHit, 0);
      strongGate = { kept: keptTerm, demoted };
    }
  }

  let results = fileResults;
  if (dedupe) {
    const groups = new Map();
    for (const file of fileResults) {
      const signature = sha1(file.blocks.map((block) => block.hash ?? block.label).join('|'));
      const group = groups.get(signature);
      if (group) {
        group.aliases.push({ path: file.path, name: file.name });
      } else {
        file.signature = signature;
        file.aliases = [];
        groups.set(signature, file);
      }
    }
    results = [...groups.values()];
  }
  results.sort((a, b) => b.keywords.length - a.keywords.length || b.blocksHit - a.blocksHit || a.rel.localeCompare(b.rel));
  const directResults = results.filter((file) => (file.directKeywords?.length ?? 0) > 0);
  const expandedResults = results.filter((file) => file.expandedOnly);
  const relatedResults = results.filter((file) => file.relatedOnly);
  const generalResults = results.filter((file) => file.generalOnly);
  const fallback = directResults.length === 0 && relatedResults.length === 0;
  const asLimit = (value) => value === 'all' ? 5000 : Math.max(1, Math.min(Number(value), 5000));
  const fallbackLimit = fallback ? Math.min(5000, asLimit(strongMax) + asLimit(assocMax)) : 0;
  let shownDirect = [];
  let shownExpanded = [];
  let shownRelated = [];
  let shownGeneral = [];
  if (fallback) {
    shownExpanded = expandedResults.slice(0, fallbackLimit);
    shownGeneral = generalResults.slice(0, Math.max(0, fallbackLimit - shownExpanded.length));
    results = [...shownExpanded, ...shownGeneral];
  } else {
    shownDirect = directResults.slice(0, normalLimit);
    shownExpanded = expandedResults.slice(0, assocLimit);
    shownRelated = relatedResults.slice(0, strongLimit);
    shownGeneral = settings.allowGeneralFiles
      ? generalResults.slice(0, Math.max(0, assocLimit - shownExpanded.length))
      : [];
    results = [...shownDirect, ...shownExpanded, ...shownRelated, ...shownGeneral];
  }
  let truncated = (directResults.length > shownDirect.length) || (expandedResults.length > shownExpanded.length) || (relatedResults.length > shownRelated.length) || (generalResults.length > shownGeneral.length);
  const finalMax = settings.finalMaxFiles ?? 'all';
  const finalLimit = finalMax === 'all' ? Infinity : Math.max(1, Math.min(Number(finalMax), 5000));
  if (results.length > finalLimit) {
    results = results.slice(0, finalLimit);
    truncated = true;
  }

  const stats = {
    documents: sync.documents ?? 0,
    ready: sync.ready ?? 0,
    pending: sync.pending ?? 0,
    changed: sync.changed ?? 0,
    cacheBytes: sync.cacheBytes ?? 0,
    libraryBytes: sync.libraryBytes ?? 0,
    cacheCapMB: config.cacheCapMB ?? 250,
    capReached: Boolean(sync.capReached),
    errors: sync.errors ?? [],
    empty: sync.empty ?? 0,
    engine: scan.engine,
    scanTruncated: Boolean(scan.truncated),
  };
  const totals = {
    files: directResults.length + expandedResults.length + relatedResults.length + generalResults.length,
    blocks: [...directResults, ...expandedResults, ...relatedResults, ...generalResults].reduce((sum, file) => sum + file.blocksHit, 0),
    directFiles: directResults.length,
    expandedFiles: expandedResults.length,
    relatedFiles: relatedResults.length,
    generalFiles: generalResults.length,
    fallback,
    directBlocks: directResults.reduce((sum, file) => sum + file.blocksHit, 0),
    expandedBlocks: expandedResults.reduce((sum, file) => sum + file.blocksHit, 0),
    relatedBlocks: relatedResults.reduce((sum, file) => sum + file.blocksHit, 0),
    generalBlocks: generalResults.reduce((sum, file) => sum + file.blocksHit, 0),
    shownFiles: results.length,
    shownBlocks: results.reduce((sum, file) => sum + file.blocks.length, 0),
  };

  return {
    library: index.root,
    query: {
      keywords,
      match,
      matchScope,
      caseSensitive,
      expand,
      expanded: Object.fromEntries(expansion),
    },
    stats,
    totals,
    caps: { normalBlocks, assocBlocks, strongBlocks, normalSnippet, assocSnippet, strongSnippet, fallbackLimit },
    truncated,
    strongGate,
    files: results,
  };
}

export async function searchLibrary(index, args, config = {}, settings = {}) {
  let current = args;
  let result = await searchOnce(index, current, config, settings);
  const maxRetries = Math.max(0, Number(settings.strongRetryMax ?? 1));
  let remaining = settings.strongRetry === true ? maxRetries : 0;
  const removed = new Set();
  while (result.strongGate?.demoted?.length && remaining > 0) {
    const fresh = result.strongGate.demoted.filter((term) => !removed.has(term));
    if (!fresh.length) break;
    for (const term of fresh) removed.add(term);
    const strongTerms = (Array.isArray(current.strongTerms) ? current.strongTerms : []).filter((term) => !removed.has(term));
    if (!strongTerms.length) break;
    current = { ...current, strongTerms };
    result = await searchOnce(index, current, config, settings);
    remaining -= 1;
  }
  return result;
}

export function renderSearchResult(result) {
  const lines = [];
  const stats = result.stats;
  const cacheNote = stats.libraryBytes
    ? `缓存 ${humanBytes(stats.cacheBytes)} / 原文件 ${humanBytes(stats.libraryBytes)}`
    : `缓存 ${humanBytes(stats.cacheBytes)}`;
  lines.push(`**库**：${result.library} · 文档 ${stats.documents}（已索引 ${stats.ready}）· ${cacheNote}`);
  const expanded = result.query.expanded;
  const expansionNotes = result.query.keywords
    .filter((keyword) => (expanded[keyword] ?? []).length > 1)
    .map((keyword) => `${keyword} → ${expanded[keyword].slice(1).join('、')}`);
  const mode = result.query.match === 'all' ? '全部命中' : '任一命中';
  const scope = result.query.matchScope === 'block' ? '同段' : '同文件';
  lines.push(`**查询**：${result.query.keywords.join(' + ')}（${mode}·${scope}）${expansionNotes.length ? ` · 关联词：${expansionNotes.join('；')}` : ''}`);
  if (result.strongGate?.demoted?.length) {
    lines.push(`**强关联词处理**：${result.strongGate.demoted.join('、')} 过宽或非最窄，已降级为一般关联，不再带入新文件${result.strongGate.kept ? `；保留 ${result.strongGate.kept}` : '；本次未保留强关联词'}。`);
  }
  if (!result.files.length) {
    lines.push('**命中**：0');
  } else {
    const directFiles = result.files.filter((file) => (file.directKeywords?.length ?? 0) > 0);
    const expandedFiles = result.files.filter((file) => file.expandedOnly);
    const relatedFiles = result.files.filter((file) => file.relatedOnly);
    const generalFiles = result.files.filter((file) => file.generalOnly);
    const countBlocks = (files) => files.reduce((sum, file) => sum + file.blocks.length, 0);
    if (result.totals.fallback) {
      lines.push(`**兜底关联命中**：自动词表 ${expandedFiles.length} + 一般关联 ${generalFiles.length} 个文件（共用上限 ${result.caps?.fallbackLimit ?? 0} 个；优先自动词表）`);
    } else {
      lines.push(`**直接命中（原词）**：${result.totals.directFiles} 个文件 / ${result.totals.directBlocks} 处（显示 ${directFiles.length} 个 / ${countBlocks(directFiles)} 处；每文件最多 ${result.caps?.normalBlocks ?? 4} 处）`);
      lines.push(`**自动扩展命中**：${result.totals.expandedFiles} 个文件 / ${result.totals.expandedBlocks} 处（显示 ${expandedFiles.length} 个 / ${countBlocks(expandedFiles)} 处；每文件最多 ${result.caps?.assocBlocks ?? 2} 处）`);
      lines.push(`**强关联命中**：${result.totals.relatedFiles} 个文件 / ${result.totals.relatedBlocks} 处（显示 ${relatedFiles.length} 个 / ${countBlocks(relatedFiles)} 处；每文件最多 ${result.caps?.strongBlocks ?? 2} 处）`);
      if (generalFiles.length) lines.push(`**一般关联命中**：${result.totals.generalFiles} 个文件 / ${result.totals.generalBlocks} 处（显示 ${generalFiles.length} 个 / ${countBlocks(generalFiles)} 处；每文件最多 ${result.caps?.assocBlocks ?? 2} 处）`);
    }
    const renderFile = (file, index) => {
      lines.push(`${index + 1}. ${markdownLink(file.name, file.path)}（${kindLabel(file.kind)}，${file.blocksHit} 处${file.aliases?.length ? `；相同内容另有 ${file.aliases.length} 个` : ''}）`);
      for (const block of file.blocks) {
        lines.push(`   - ${block.label}${block.snippet ? `：${block.snippet}` : ''}`);
      }
      if (file.blocksHit > file.blocks.length) lines.push(`   - …另有 ${file.blocksHit - file.blocks.length} 处未显示（可加 subpath 或更精确的关键词）`);
    };
    if (directFiles.length) {
      lines.push('**直接命中原词（全部列出）**');
      directFiles.forEach(renderFile);
    }
    if (expandedFiles.length) {
      lines.push(result.totals.fallback ? '**兜底命中·自动词表（优先）**' : '**自动扩展命中（按关联词输出上限截断）**');
      expandedFiles.forEach(renderFile);
    }
    if (relatedFiles.length) {
      lines.push('**强关联命中（按强关联输出上限截断）**');
      relatedFiles.forEach(renderFile);
    }
    if (generalFiles.length) {
      lines.push(result.totals.fallback ? '**兜底命中·一般关联**' : '**一般关联命中（补位）**');
      generalFiles.forEach(renderFile);
    }
  }
  if (result.truncated) lines.push(`（文件较多，仅显示前 ${result.totals.shownFiles} 个；缩小范围可加 subpath 或 maxFiles）`);
  if (stats.pending > 0) lines.push(`（另有 ${stats.pending} 个文件尚未建索引，再调用一次可继续；缓存上限 ${stats.cacheCapMB} MB）`);
  if (stats.empty > 0) lines.push(`（${stats.empty} 个文件没有可抽取的文本，可能是扫描件或空文档）`);
  if (stats.capReached) lines.push(`（缓存已达到 ${stats.cacheCapMB} MB 上限，未继续索引；可在配置里提高 cacheCapMB）`);
  if (stats.engine === 'js') lines.push('（未找到 ripgrep，已退回内置扫描）');
  if (stats.scanTruncated) lines.push('（命中过多，扫描在 50000 行处截断；可用更精确的关键词或 subpath 缩小范围）');
  return lines.join('\n');
}
