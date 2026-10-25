import fs from "node:fs";
const p="lib/index.js";
let c=fs.readFileSync(p,"utf8");
c=c.replace("import { humanBytes } from './util.js';","import { humanBytes, toPosix } from './util.js';");
c=c.replace("function textRender(text) {", `async function libraryStatus(index, args, config) {
  const manifest = await index.loadManifest();
  const entries = manifest.files || {};
  const cacheFound = Object.keys(entries).length > 0;
  const files = await index.walk();
  let matched = 0;
  let changed = 0;
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
    else if (entry.err || entry.mtimeMs !== stat.mtimeMs || entry.size !== stat.size) changed += 1;
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
    missing: onlyCache,
    cacheBytes: stats.cacheBytes,
    updatedAt: manifest.updatedAt || null,
    repaired: repaired ? { changed: repaired.changed, removed: repaired.removed, pending: repaired.pending } : null,
  };
}

function textRender(text) {`);
c=c.replace("const INDEX_PARAMETERS = {", `const STATUS_PARAMETERS = {
  library: { type: 'string', required: true, description: '题库根目录的绝对路径。' },
  repair: { type: 'boolean', description: '发现变更时是否立即补索引（默认 false，只检查）。' },
  budget: { type: 'integer', description: 'repair=true 时最多处理多少个文件。' },
};

const INDEX_PARAMETERS = {`);
c=c.replace("  try {\n    ctx.logger(name).info('library-search tools registered');", `  ctx.tools.register(
    defineTool({
      name: 'library_status',
      description:
        '绑定题库路径并检查本地索引：报告是否已有索引、本机文件有多少匹配/需更新/缓存多余；repair=true 时顺带补索引。用于用户填完路径后的第一步，避免重复建库。',
      parameters: STATUS_PARAMETERS,
      output: { schema: { type: 'object', additionalProperties: true }, render: (_args, value) => textRender(
        value.cacheFound
          ? \`已链接本地索引：\${value.cacheDir}\\n文件 \${value.documents} 个；本机匹配 \${value.matched}，需更新 \${value.changed}，缓存多余 \${value.missing}；缓存 \${humanBytes(value.cacheBytes)}\${value.repaired ? \`\\n本次修复：更新 \${value.repaired.changed}，删除 \${value.repaired.removed}，剩余待索引 \${value.repaired.pending}\` : ''}\`
          : \`未找到现成索引（\${value.cacheDir}）；首次检索会按预算建立。\`,
      ) },
      timeoutMs: 10 * 60 * 1000,
      isConcurrencySafe: () => false,
      async execute(args) {
        const library = resolveLibrary(args, resolved);
        const index = indexFor(library, resolved);
        return libraryStatus(index, args ?? {}, resolved);
      },
    }),
  );

  try {
    ctx.logger(name).info('library-search tools registered');`);
fs.writeFileSync(p,c,"utf8");
console.log("library_status added");
