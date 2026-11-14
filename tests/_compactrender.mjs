import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("    if (result.truncated) lines.push(`（文件较多，仅显示前 ${result.totals.shownFiles} 个；缩小范围可加 subpath 或 maxFiles）`);","    if (result.truncated && !result.listAll) lines.push(`（默认只列前 ${result.totals.shownFiles} 个文件；另有 ${Math.max(0, result.totals.files - result.totals.shownFiles)} 个未列出。需要完整列表请明确说“全部列出”。）`);");
fs.writeFileSync(p,c,"utf8");
console.log("compact render summary");
