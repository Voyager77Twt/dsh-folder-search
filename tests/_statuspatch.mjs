import fs from "node:fs";
const p="lib/index.js";
let c=fs.readFileSync(p,"utf8");
c=c.replace("  let matched = 0;\n  let changed = 0;\n  let onlyCache = 0;","  let matched = 0;\n  let changed = 0;\n  let failed = 0;\n  let onlyCache = 0;");
c=c.replace("    if (!entry) changed += 1;\n    else if (entry.err || entry.mtimeMs !== stat.mtimeMs || entry.size !== stat.size) changed += 1;\n    else matched += 1;","    if (!entry) changed += 1;\n    else if (entry.err) failed += 1;\n    else if (entry.mtimeMs !== stat.mtimeMs || entry.size !== stat.size) changed += 1;\n    else matched += 1;");
c=c.replace("    changed,\n    missing: onlyCache,","    changed,\n    failed,\n    missing: onlyCache,");
c=c.replace("\\`已链接本地索引：\${value.cacheDir}\\\\n文件 \${value.documents} 个；本机匹配 \${value.matched}，需更新 \${value.changed}，缓存多余 \${value.missing}；缓存 \${humanBytes(value.cacheBytes)}","\\`已链接本地索引：\${value.cacheDir}\\\\n文件 \${value.documents} 个；本机匹配 \${value.matched}，需更新 \${value.changed}，失败 \${value.failed ?? 0}，缓存多余 \${value.missing}；缓存 \${humanBytes(value.cacheBytes)}");
fs.writeFileSync(p,c,"utf8");
console.log("status failed count patched");
