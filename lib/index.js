import path from 'node:path';
import fs from 'node:fs/promises';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { indexFor } from './indexer.js';
import { searchLibrary, renderSearchResult } from './search.js';
import { outlineLibrary } from './outline.js';
import { readLibraryDocument, renderReadResult } from './read.js';
import { exportPaper } from './export.js';
import { collectPendingLegacy, preconvertLegacy } from './legacy-batch.js';
import { exportIndexPackage, importIndexPackage } from './index-package.js';
import { humanBytes, toPosix } from './util.js';
import { loadSettings } from './settings-store.js';
import { registerSettingsRoute } from './settings-host.js';
import { SUBJECT_IDS } from './subject-dictionaries.js';

export const name = 'folder-search';
export const inject = ['tools', 'webServer'];

function numberOr(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeConfig(input = {}) {
  const libraries = Array.isArray(input.libraries)
    ? input.libraries.filter((item) => typeof item === 'string' && item.trim()).map((item) => path.resolve(item))
    : [];
  return {
    libraries,
    cacheDir: input.cacheDir ? path.resolve(input.cacheDir) : null,
    rgPath: input.rgPath || null,
    associations: { ...(input.associations && typeof input.associations === 'object' ? input.associations : {}) },
    indexBudgetPerCall: Math.max(1, numberOr(input.indexBudgetPerCall, 25)),
    forceBudget: Math.max(1, numberOr(input.forceBudget, 300)),
    maxFiles: Math.max(1, numberOr(input.maxFiles, 25)),
    maxBlocksPerFile: Math.max(1, numberOr(input.maxBlocksPerFile, 4)),
    maxFileMB: Math.max(1, numberOr(input.maxFileMB, 200)),
    cacheCapMB: Math.max(10, numberOr(input.cacheCapMB, 250)),
    snippetChars: Math.max(20, numberOr(input.snippetChars, 120)),
    dedupe: input.dedupe === true,
    expandMaxFiles: Math.max(1, numberOr(input.expandMaxFiles, 8)),
    expandMaxBlocksPerFile: Math.max(1, numberOr(input.expandMaxBlocksPerFile, 2)),
    expandSnippetChars: Math.max(20, numberOr(input.expandSnippetChars, 60)),
    outputDir: input.outputDir ? path.resolve(input.outputDir) : null,
    parseIsolation: input.parseIsolation !== false,
    parseWorkerMB: Math.max(64, Math.min(1024, numberOr(input.parseWorkerMB, 256))),
    officeAllowMacros: input.officeAllowMacros === true,
    security: {
      zipMaxEntries: Math.max(16, Math.min(20000, numberOr(input.zipMaxEntries, 5000))),
      zipMaxEntryMB: Math.max(1, Math.min(1024, numberOr(input.zipMaxEntryMB, 64))),
      zipMaxTotalMB: Math.max(8, Math.min(4096, numberOr(input.zipMaxTotalMB, 512))),
      zipMaxRatio: Math.max(2, Math.min(1000, numberOr(input.zipMaxRatio, 200))),
      maxTextMB: Math.max(1, Math.min(200, numberOr(input.maxTextMB, 20))),
    },
  };
}

function resolveLibraries(args, config, settings = {}) {
  const explicit = args?.library && String(args.library).trim();
  const configured = Array.isArray(settings.libraryRoots) && settings.libraryRoots.length
    ? settings.libraryRoots
    : (settings.libraryRoot ? [settings.libraryRoot] : (config.libraries || []));
  const values = explicit ? [explicit] : configured;
  const seen = new Set();
  const roots = [];
  for (const value of values) {
    const root = path.resolve(String(value));
    const key = root.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    roots.push(root);
  }
  if (!roots.length) {
    throw new Error('还没有指定题库文件夹。请在「本地搜索设置」里填写题库位置，或把绝对路径作为 library 参数传入（例如 D:\\题库）。');
  }
  return roots;
}

function categoryRank(file) {
  if ((file.directKeywords?.length ?? 0) > 0) return 0;
  if (file.expandedOnly) return 1;
  if (file.relatedOnly) return 2;
  return 3;
}

export function mergeSearchResults(results, settings) {
  if (results.length === 1) return results[0];
  const files = results.flatMap((result) => result.files.map((file) => ({ ...file, library: result.library })));
  files.sort((a, b) => categoryRank(a) - categoryRank(b));
  const finalMax = results.some((result) => result.listAll) ? 'all' : (settings.finalMaxFiles ?? 'all');
  const finalLimit = finalMax === 'all' ? 5000 : Math.max(1, Math.min(Number(finalMax), 5000));
  const shown = files.slice(0, finalLimit);
  const totals = {
    files: results.reduce((n, result) => n + (result.totals?.files ?? 0), 0),
    blocks: results.reduce((n, result) => n + (result.totals?.blocks ?? 0), 0),
    directFiles: results.reduce((n, result) => n + (result.totals?.directFiles ?? 0), 0),
    expandedFiles: results.reduce((n, result) => n + (result.totals?.expandedFiles ?? 0), 0),
    relatedFiles: results.reduce((n, result) => n + (result.totals?.relatedFiles ?? 0), 0),
    generalFiles: results.reduce((n, result) => n + (result.totals?.generalFiles ?? 0), 0),
    directBlocks: results.reduce((n, result) => n + (result.totals?.directBlocks ?? 0), 0),
    expandedBlocks: results.reduce((n, result) => n + (result.totals?.expandedBlocks ?? 0), 0),
    relatedBlocks: results.reduce((n, result) => n + (result.totals?.relatedBlocks ?? 0), 0),
    generalBlocks: results.reduce((n, result) => n + (result.totals?.generalBlocks ?? 0), 0),
    fallback: results.some((result) => result.totals?.fallback),
    shownFiles: shown.length,
    shownBlocks: shown.reduce((n, file) => n + (file.blocks?.length ?? 0), 0),
  };
  const stats = {
    ...results[0].stats,
    documents: results.reduce((n, result) => n + (result.stats?.documents ?? 0), 0),
    ready: results.reduce((n, result) => n + (result.stats?.ready ?? 0), 0),
    pending: results.reduce((n, result) => n + (result.stats?.pending ?? 0), 0),
    failed: results.reduce((n, result) => n + (result.stats?.failed ?? 0), 0),
    cacheBytes: results.reduce((n, result) => n + (result.stats?.cacheBytes ?? 0), 0),
    libraryBytes: results.reduce((n, result) => n + (result.stats?.libraryBytes ?? 0), 0),
    capReached: results.some((result) => result.stats?.capReached),
    errors: results.flatMap((result) => result.stats?.errors ?? []),
  };
  const demoted = [...new Set(results.flatMap((result) => result.strongGate?.demoted ?? []))];
  const kept = [...new Set(results.flatMap((result) => result.strongGate?.kept ?? (result.strongGate?.kept ? [result.strongGate.kept] : [])))];
  return {
    ...results[0],
    library: results.map((result) => result.library).join('、'),
    libraries: results.map((result) => result.library),
    files: shown,
    totals,
    stats,
    query: { ...results[0].query, libraries: results.map((result) => result.library) },
    truncated: results.some((result) => result.truncated) || shown.length < files.length,
    strongGate: demoted.length || kept.length ? { kept, demoted } : null,
  };
}

async function searchLibraries(indexes, args, config, settings) {
  if (indexes.length === 1) return searchLibrary(indexes[0].index, args, config, settings);
  const results = [];
  for (const entry of indexes) results.push(await searchLibrary(entry.index, args, config, { ...settings, finalMaxFiles: 'all' }));
  return mergeSearchResults(results, settings);
}

async function prepareTool(args, resolved) {
  const settings = await loadSettings();
  const config = {
    ...resolved,
    cacheDir: settings.cacheDir ? path.resolve(settings.cacheDir) : resolved.cacheDir,
    indexConcurrency: settings.indexConcurrency,
    maxFileMB: settings.maxFileMB,
    parseIsolation: settings.parseIsolation !== false,
    parseWorkerMB: settings.parseWorkerMB,
    officeAllowMacros: settings.officeAllowMacros === true,
    security: {
      zipMaxEntries: settings.zipMaxEntries,
      zipMaxEntryMB: settings.zipMaxEntryMB,
      zipMaxTotalMB: settings.zipMaxTotalMB,
      zipMaxRatio: settings.zipMaxRatio,
      maxTextMB: settings.maxTextMB,
    },
  };
  const libraries = resolveLibraries(args, resolved, settings);
  const indexes = libraries.map((library) => ({ library, index: indexFor(library, config) }));
  const library = libraries[0];
  const index = indexes[0].index;
  return { settings, config, library, libraries, indexes, index };
}

async function libraryStatus(index, args, config) {
  const manifest = await index.loadManifest();
  const entries = manifest.files || {};
  const cacheFound = Object.keys(entries).length > 0;
  const files = await index.walk();
  let matched = 0;
  let changed = 0;
  let failed = 0;
  let onlyCache = 0;
  const seen = new Set();
  for (const abs of files) {
    const rel = toPosix(path.relative(index.root, abs));
    seen.add(rel);
    let stat;
    try {
      stat = await fs.stat(abs);
    } catch {
      continue;
    }
    const entry = entries[rel];
    if (!entry) changed += 1;
    else if (entry.err) failed += 1;
    else if (entry.mtimeMs !== stat.mtimeMs || entry.size !== stat.size) changed += 1;
    else matched += 1;
  }
  for (const rel of Object.keys(entries)) if (!seen.has(rel)) onlyCache += 1;
  let repaired = null;
  if (args?.repair) repaired = await index.sync({ budget: Number(args.budget ?? config.indexBudgetPerCall) });
  const stats = await index.stats();
  return {
    library: index.root,
    cacheDir: index.cacheDir,
    cacheFound,
    documents: Object.keys(entries).length,
    matched,
    changed,
    failed,
    missing: onlyCache,
    cacheBytes: stats.cacheBytes,
    updatedAt: manifest.updatedAt || null,
    repaired: repaired ? { changed: repaired.changed, removed: repaired.removed, pending: repaired.pending } : null,
  };
}

function textRender(text) {
  return [{ type: 'text', text }];
}

const SEARCH_PARAMETERS = {
  library: { type: 'string', description: '题库根目录的绝对路径；省略时使用设置页题库位置或插件配置的第一个库。' },
  keywords: {
    type: 'array',
    items: { type: 'string' },
    required: true,
    description: '只能放用户原话中的检索词（1–3 个）；不要放同义词、别名、旧称、缩写或领域词，补充词放 strongTerms/generalTerms，不要复制进 keywords。',
  },
  subject: { type: 'string', enum: SUBJECT_IDS, description: '可选：如果题目明显属于某一学科，选一个以激活该学科的通用关联词；不确定就省略。学科词表只做扩展召回，不是硬分类，也不改变 keywords。' },
  match: { type: 'string', enum: ['all', 'any'], description: 'all=文件需包含全部关键词；any=任一即可（默认 any）。' },
  all: { type: 'boolean', description: '仅在用户明确说“全部列出/列出所有文件”时设为 true；默认 false，只列前 N 个文件，且每文件仍只列前 2 条命中。' },
  strongTerms: { type: 'array', items: { type: 'string' }, description: '模型自检：人名、旧称、别名、缩写、近义词、标准术语优先放 strongTerms，最多按设置页上限填；学科不限。示例：历史 辛亥革命→武昌起义/孙中山；生物 光合作用→卡尔文循环/叶绿体；物理 牛顿第二定律→F=ma/惯性系。不要放父类/领域词。generalTerms 只放宽泛领域词/上下文词。' },
  generalTerms: { type: 'array', items: { type: 'string' }, description: '只放模型补充的宽泛领域词/上下文词；不要放人物、专名、别名、缩写或近义词，这些放 strongTerms。数量由设置页“关联词数量上限”限制，关闭第5步则忽略。' },
  subpath: { type: 'string', description: '限定题库下的子目录或单个文件（相对路径）。' },
  caseSensitive: { type: 'boolean', description: '区分大小写（默认 false）。' },
  refresh: { type: 'string', enum: ['auto', 'force', 'never'], description: 'auto=增量索引（默认）；force=重建改动的文件并放宽预算；never=只用现有缓存。' },
};

const OUTLINE_PARAMETERS = {
  library: { type: 'string', description: '题库根目录的绝对路径。' },
  subpath: { type: 'string', description: '限定题库下的子目录。' },
  refresh: { type: 'string', enum: ['auto', 'force', 'never'], description: '是否先同步索引（默认 auto）。' },
  maxFiles: { type: 'integer', description: '最多列出多少个文件（默认 60）。' },
  includeQuestions: { type: 'boolean', description: '是否列出题号位置（默认 true）。' },
};

const READ_PARAMETERS = {
  library: { type: 'string', description: '题库根目录的绝对路径。' },
  path: { type: 'string', required: true, description: '文件的绝对路径，或相对题库的路径。' },
  question: { type: 'string', description: '只读某道题：题号，如 "16"。' },
  from: { type: 'integer', description: '起始位置序号（段落/页/幻灯片），可选。' },
  to: { type: 'integer', description: '结束位置序号（不含），可选。' },
  maxChars: { type: 'integer', description: '最多返回多少字符（默认 12000，上限 60000）。' },
};

const STATUS_PARAMETERS = {
  library: { type: 'string', required: true, description: '题库根目录的绝对路径。' },
  repair: { type: 'boolean', description: '发现变更时是否立即补索引（默认 false，只检查）。' },
  budget: { type: 'integer', description: 'repair=true 时最多处理多少个文件。' },
};

const INDEX_PARAMETERS = {
  library: { type: 'string', description: '题库根目录的绝对路径。' },
  maxMinutes: { type: 'integer', description: '本次最多跑多少分钟（默认 10，上限 60）；到点返回进度，可再次调用继续。' },
  legacyBatch: { type: 'integer', description: '每批预转换多少个旧版 .doc/.rtf（默认 20）。' },
  budget: { type: 'integer', description: '每轮最多抽取多少个文件（默认用插件配置）。' },
};

const INDEX_EXPORT_PARAMETERS = {
  library: { type: 'string', description: '题库根目录的绝对路径。' },
  output: { type: 'string', description: '输出 zip 的绝对路径；省略时写到当前工作目录的 索引包.zip。' },
};

const INDEX_IMPORT_PARAMETERS = {
  library: { type: 'string', required: true, description: '题库根目录的绝对路径。' },
  package: { type: 'string', required: true, description: '别人发来的索引包 .zip 绝对路径。' },
  verify: { type: 'string', enum: ['mtime', 'size', 'none'], description: '本地校验方式：mtime=大小+修改时间（默认），size=只比大小，none=不校验。' },
  dryRun: { type: 'boolean', description: '只报告会保留/丢弃多少，不写入缓存。' },
};

const EXPORT_PARAMETERS = {
  title: { type: 'string', required: true, description: '试卷标题。' },
  questions: {
    type: 'array',
    required: true,
    description: '题目列表。',
    items: {
      type: 'object',
      additionalProperties: false,
      properties: {
        number: { type: 'string', description: '题号，可省略。' },
        text: { type: 'string', required: true, description: '题干（可含换行）。' },
        score: { type: 'string', description: '分值。' },
        answer: { type: 'string', description: '参考答案。' },
        source: { type: 'string', description: '来源文件路径（可选）。' },
      },
    },
  },
  outputDir: { type: 'string', description: '输出目录（绝对路径）；默认 当前工作目录\\组卷。' },
  filename: { type: 'string', description: '文件名（不含扩展名）。' },
  includeAnswers: { type: 'boolean', description: '是否附参考答案（默认 true）。' },
};

export function apply(ctx, config) {
  const resolved = normalizeConfig(config);
  if (config && config.settingsOnly === true) {
    registerSettingsRoute(ctx);
    return;
  }

  ctx.tools.register(
    defineTool({
      name: 'library_search',
      description:
        '在题库文件夹（Word/PDF/PPT/Excel）中按关键词检索，返回命中文件的绝对路径、可点击位置（Word 段落、PDF 页码、Excel 单元格、PPT 幻灯片）和短片段。只回传命中片段，不读整份文件。首次检索会先建文本缓存，可能分批完成。',
      parameters: SEARCH_PARAMETERS,
      output: { schema: { type: 'object', additionalProperties: true }, render: (_args, value) => textRender(renderSearchResult(value)) },
      timeoutMs: 15 * 60 * 1000,
      isConcurrencySafe: () => false,
      async execute(args) {
        const { settings, config, indexes } = await prepareTool(args, resolved);
        return searchLibraries(indexes, args ?? {}, config, settings);
      },
    }),
  );

  ctx.tools.register(
    defineTool({
      name: 'library_outline',
      description:
        '列出题库的目录结构与每个文件里的“大题”和题号位置（第几页/第几段/第几张），用于先判断某类题在哪个文件、哪个位置，再决定检索词。输出只有目录和位置，没有正文。',
      parameters: OUTLINE_PARAMETERS,
      output: { schema: { type: 'object', additionalProperties: true }, render: (_args, value) => textRender(value?.text ?? '') },
      timeoutMs: 15 * 60 * 1000,
      isConcurrencySafe: () => false,
      async execute(args) {
        const { settings, config, indexes } = await prepareTool(args, resolved);
        const outlined = [];
        for (const entry of indexes) outlined.push({ library: entry.library, value: await outlineLibrary(entry.index, args ?? {}, settings) });
        if (outlined.length === 1) return outlined[0].value;
        return { text: outlined.map((item) => `## ${item.library}\n${item.value?.text ?? ''}`).join('\n\n'), libraries: outlined.map((item) => item.library) };
      },
    }),
  );

  ctx.tools.register(
    defineTool({
      name: 'library_read',
      description:
        '按文件与题号/位置读取题库中的正文（分段/分页返回，有字符上限）。用于组卷前核对完整题目；不要用它通读整本书。',
      parameters: READ_PARAMETERS,
      output: { schema: { type: 'object', additionalProperties: true }, render: (_args, value) => textRender(renderReadResult(value)) },
      timeoutMs: 5 * 60 * 1000,
      isConcurrencySafe: () => true,
      async execute(args) {
        const { settings, config, indexes } = await prepareTool(args, resolved);
        let selected = indexes[0];
        if (indexes.length > 1) {
          const target = String(args?.path ?? '');
          const byPath = indexes.find((entry) => target.toLowerCase().startsWith(entry.library.toLowerCase() + path.sep));
          if (byPath) selected = byPath;
          else if (indexes.length > 1) throw new Error('当前配置了多个题库，请传 library 指定要读取的题库。');
        }
        if (args?.refresh !== 'never') await selected.index.sync({ budget: config.indexBudgetPerCall });
        return readLibraryDocument(selected.index, args ?? {}, resolved);
      },
    }),
  );

  ctx.tools.register(
    defineTool({
      name: 'library_export',
      description:
        '把整理好的题目导出成 .docx 试卷（实验功能），默认写到 当前工作目录\\组卷。导出后应使用 present 把文件展示给用户。',
      parameters: EXPORT_PARAMETERS,
      output: { schema: { type: 'object', additionalProperties: true }, render: (_args, value) => textRender(`已生成试卷：${value.path}\n（${value.questions} 题，${value.bytes} 字节）`) },
      timeoutMs: 2 * 60 * 1000,
      isConcurrencySafe: () => false,
      async execute(args) {
        return exportPaper(args ?? {}, resolved);
      },
    }),
  );


  ctx.tools.register(
    defineTool({
      name: 'library_index',
      description:
        '批量建索引：先用一个 Word 会话预转换旧版 .doc/.rtf，再循环抽取文字，适合首次建库或大批更新。受 maxMinutes 限制，返回进度；可多次调用继续。',
      parameters: INDEX_PARAMETERS,
      output: {
        schema: { type: 'object', additionalProperties: true },
        render: (_args, value) =>
          textRender(
            `索引：${value.library}\n文档 ${value.documents}（已索引 ${value.ready}，失败 ${value.failed}，空文本 ${value.empty}）\n缓存 ${humanBytes(value.cacheBytes)}（上限 ${value.cacheCapMB} MB）\n本次预转换旧版文档 ${value.convertedLegacy} 个${value.skipped ? `，跳过 ${value.skipped} 个` : ''}`,
          ),
      },
      timeoutMs: 45 * 60 * 1000,
      isConcurrencySafe: () => false,
      async execute(args) {
        const { settings, config, library, index } = await prepareTool(args, resolved);
        const minutes = Math.max(1, Math.min(Number(args?.maxMinutes ?? 10), 60));
        const deadline = Date.now() + minutes * 60 * 1000;
        const skip = new Set();
        const dirs = [];
        const originalDir = process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR;
        const originalStrict = process.env.DSH_LIBSEARCH_LEGACY_STRICT;
        let convertedLegacy = 0;
        let last = null;
        try {
          for (let round = 0; round < 80 && Date.now() < deadline; round++) {
            const limit = Math.max(5, Math.min(Number(args?.legacyBatch ?? 20), 120));
            const pending = await collectPendingLegacy(index, limit, skip);
            if (pending.length) {
              const batch = await preconvertLegacy(index, pending, { allowMacros: settings.officeAllowMacros === true });
              dirs.push(batch.dir);
              convertedLegacy += batch.converted;
              for (const failure of batch.failed) skip.add(failure.src);
              process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR = batch.dir;
              process.env.DSH_LIBSEARCH_LEGACY_STRICT = '1';
            }
            const budget = Math.max(Number(args?.budget ?? config.indexBudgetPerCall), limit + 5);
            last = await index.sync({ budget, retryErrors: true });
            if (last.pending === 0 || last.pending === last.failed) break;
            if (!pending.length && last.changed === 0) break;
          }
        } finally {
          if (originalDir === undefined) delete process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR;
          else process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR = originalDir;
          if (originalStrict === undefined) delete process.env.DSH_LIBSEARCH_LEGACY_STRICT;
          else process.env.DSH_LIBSEARCH_LEGACY_STRICT = originalStrict;
          for (const dir of dirs) await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
        }
        const stats = await index.stats();
        const sync = last ?? (await index.sync({ budget: 0 }));
        return {
          library,
          documents: stats.documents,
          ready: stats.ready,
          failed: sync.failed ?? 0,
          empty: sync.empty ?? 0,
          pending: sync.pending ?? 0,
          cacheBytes: stats.cacheBytes,
          cacheCapMB: config.cacheCapMB,
          convertedLegacy,
          skipped: skip.size,
        };
      },
    }),
  );

  ctx.tools.register(
    defineTool({
      name: 'library_index_export',
      description: '把当前题库的文本索引打包成 zip，发给别人；对方用 library_index_import 做本地校验后直接使用。',
      parameters: INDEX_EXPORT_PARAMETERS,
      output: { schema: { type: 'object', additionalProperties: true }, render: (_args, value) => textRender(`索引包：${value.path}\n${value.documents} 个文档，${humanBytes(value.bytes)}`) },
      timeoutMs: 10 * 60 * 1000,
      isConcurrencySafe: () => false,
      async execute(args) {
        const { settings, config, library, index } = await prepareTool(args, resolved);
        const output = args?.output ? path.resolve(String(args.output)) : path.join(process.cwd(), '索引包.zip');
        return exportIndexPackage(index, output);
      },
    }),
  );

  ctx.tools.register(
    defineTool({
      name: 'library_index_import',
      description: '导入别人分享的索引包：按本地文件的修改时间/大小校验，保留匹配的、丢弃不匹配的；其余文件仍可后续补索引。',
      parameters: INDEX_IMPORT_PARAMETERS,
      output: {
        schema: { type: 'object', additionalProperties: true },
        render: (_args, value) =>
          textRender(
            `索引包导入：保留 ${value.kept}/${value.total}，丢弃 ${value.dropped}（校验 ${value.verify}${value.dryRun ? '，仅预演' : ''}）\n缓存 ${humanBytes(value.cacheBytes)}`,
          ),
      },
      timeoutMs: 15 * 60 * 1000,
      isConcurrencySafe: () => false,
      async execute(args) {
        const { settings, config, library, index } = await prepareTool(args, resolved);
        if (!args?.package) throw new Error('缺少 package 参数（索引包 zip 的绝对路径）');
        return importIndexPackage(index, String(args.package), { verify: args.verify, dryRun: args.dryRun });
      },
    }),
  );

  ctx.tools.register(
    defineTool({
      name: 'library_status',
      description:
        '绑定题库路径并检查本地索引：报告是否已有索引、本机文件有多少匹配/需更新/缓存多余；repair=true 时顺带补索引。用于用户填完路径后的第一步，避免重复建库。',
      parameters: STATUS_PARAMETERS,
      output: { schema: { type: 'object', additionalProperties: true }, render: (_args, value) => textRender(
        value?.text ?? (value.cacheFound
          ? `已链接本地索引：${value.cacheDir}\n文件 ${value.documents} 个；本机匹配 ${value.matched}，需更新 ${value.changed}，缓存多余 ${value.missing}；缓存 ${humanBytes(value.cacheBytes)}${value.repaired ? `\n本次修复：更新 ${value.repaired.changed}，删除 ${value.repaired.removed}，剩余待索引 ${value.repaired.pending}` : ''}`
          : `未找到现成索引（${value.cacheDir}）；首次检索会按预算建立。`),
      ) },
      timeoutMs: 10 * 60 * 1000,
      isConcurrencySafe: () => false,
      async execute(args) {
        const { settings, config, indexes } = await prepareTool(args, resolved);
        const values = [];
        for (const entry of indexes) values.push({ ...(await libraryStatus(entry.index, args ?? {}, config)), library: entry.library });
        if (values.length === 1) return values[0];
        const text = values.map((value) => value.cacheFound
          ? `${value.library}\n已链接本地索引：${value.cacheDir}\n文件 ${value.documents} 个；本机匹配 ${value.matched}，需更新 ${value.changed}，缓存多余 ${value.missing}；缓存 ${humanBytes(value.cacheBytes)}`
          : `${value.library}\n未找到现成索引（${value.cacheDir}）；首次检索会按预算建立。`).join('\n\n');
        return {
          text,
          libraries: values,
          cacheFound: values.some((value) => value.cacheFound),
          cacheDir: `${values.length} 个库`,
          documents: values.reduce((n, value) => n + (value.documents ?? 0), 0),
          matched: values.reduce((n, value) => n + (value.matched ?? 0), 0),
          changed: values.reduce((n, value) => n + (value.changed ?? 0), 0),
          failed: values.reduce((n, value) => n + (value.failed ?? 0), 0),
          missing: values.reduce((n, value) => n + (value.missing ?? 0), 0),
          cacheBytes: values.reduce((n, value) => n + (value.cacheBytes ?? 0), 0),
        };
      },
    }),
  );

  try {
    ctx.logger(name).info('library-search tools registered');
  } catch {
    /* logging is best effort */
  }
}
