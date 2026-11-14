import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
const old="  lines.push(`**库**：${result.library} · 文档 ${stats.documents}（已索引 ${stats.ready}）· ${cacheNote}`);";
const neu="  const libraryLabel = Array.isArray(result.libraries) && result.libraries.length > 1 ? `${result.libraries.join('、')}（${result.libraries.length} 个库）` : result.library;\n  lines.push(`**库**：${libraryLabel} · 文档 ${stats.documents}（已索引 ${stats.ready}）· ${cacheNote}`);";
if(!c.includes(old)) throw new Error('library render marker missing');
c=c.replace(old,neu);
fs.writeFileSync(p,c,"utf8");
console.log("multi library render");
