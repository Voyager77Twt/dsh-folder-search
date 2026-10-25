import fs from "node:fs";
const p="lib/index.js";
let c=fs.readFileSync(p,"utf8");
c=c.replace("import path from 'node:path';","import path from 'node:path';\nimport fs from 'node:fs/promises';");
c=c.replace("import { exportPaper } from './export.js';","import { exportPaper } from './export.js';\nimport { collectPendingLegacy, preconvertLegacy } from './legacy-batch.js';\nimport { exportIndexPackage, importIndexPackage } from './index-package.js';\nimport { humanBytes } from './util.js';");
c=c.replace("const EXPORT_PARAMETERS = {", `const INDEX_PARAMETERS = {
  library: { type: 'string', description: '题库根目录的绝对路径。' },
  maxMinutes: { type: 'integer', description: '本次最多跑多少分钟（默认 10，上限 60）；到点返回进度，可再次调用继续。' },
  legacyBatch: { type: 'integer', description: '每批预转换多少个旧版 .doc/.rtf（默认 40）。' },
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

const EXPORT_PARAMETERS = {`);
const toolCode = `
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
            \`索引：\${value.library}\\n文档 \${value.documents}（已索引 \${value.ready}，失败 \${value.failed}，空文本 \${value.empty}）\\n缓存 \${humanBytes(value.cacheBytes)}（上限 \${value.cacheCapMB} MB）\\n本次预转换旧版文档 \${value.convertedLegacy} 个\${value.skipped ? \`，跳过 \${value.skipped} 个\` : ''}\`,
          ),
      },
      timeoutMs: 45 * 60 * 1000,
      isConcurrencySafe: () => false,
      async execute(args) {
        const library = resolveLibrary(args, resolved);
        const index = indexFor(library, resolved);
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
            const limit = Math.max(5, Math.min(Number(args?.legacyBatch ?? 40), 120));
            const pending = await collectPendingLegacy(index, limit, skip);
            if (pending.length) {
              const batch = await preconvertLegacy(index, pending);
              dirs.push(batch.dir);
              convertedLegacy += batch.converted;
              for (const failure of batch.failed) skip.add(failure.src);
              process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR = batch.dir;
              process.env.DSH_LIBSEARCH_LEGACY_STRICT = '1';
            }
            const budget = Math.max(Number(args?.budget ?? resolved.indexBudgetPerCall), limit + 5);
            last = await index.sync({ budget });
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
          cacheCapMB: resolved.cacheCapMB,
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
      output: { schema: { type: 'object', additionalProperties: true }, render: (_args, value) => textRender(\`索引包：\${value.path}\\n\${value.documents} 个文档，\${humanBytes(value.bytes)}\`) },
      timeoutMs: 10 * 60 * 1000,
      isConcurrencySafe: () => false,
      async execute(args) {
        const library = resolveLibrary(args, resolved);
        const index = indexFor(library, resolved);
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
            \`索引包导入：保留 \${value.kept}/\${value.total}，丢弃 \${value.dropped}（校验 \${value.verify}\${value.dryRun ? '，仅预演' : ''}）\\n缓存 \${humanBytes(value.cacheBytes)}\`,
          ),
      },
      timeoutMs: 15 * 60 * 1000,
      isConcurrencySafe: () => false,
      async execute(args) {
        const library = resolveLibrary(args, resolved);
        const index = indexFor(library, resolved);
        if (!args?.package) throw new Error('缺少 package 参数（索引包 zip 的绝对路径）');
        return importIndexPackage(index, String(args.package), { verify: args.verify, dryRun: args.dryRun });
      },
    }),
  );

  try {
    ctx.logger(name).info('library-search tools registered');`;
c=c.replace("  try {\n    ctx.logger(name).info('library-search tools registered');", toolCode);
fs.writeFileSync(p,c,"utf8");
console.log("index tools added");
