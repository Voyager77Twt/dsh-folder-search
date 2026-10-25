import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("        group.aliases.push({ path: file.path, name: file.name });\n        group.blocksHit += file.blocksHit;","        group.aliases.push({ path: file.path, name: file.name });");
c=c.replace("    totals,\n    truncated,","    totals,\n    caps: { normalBlocks, strongBlocks, normalSnippet, strongSnippet },\n    truncated,");
c=c.replace("    lines.push(`**命中**：直接 ${result.totals.directFiles} 个文件 / ${result.totals.directBlocks} 处；仅关联词 ${result.totals.relatedFiles} 个文件 / ${result.totals.relatedBlocks} 处（显示 ${directFiles.length} 个直接、${relatedFiles.length} 个关联）`);","    lines.push(`**直接命中（原词）**：${directFiles.length} 个文件 / ${result.totals.directBlocks} 处（文件全部列出；每文件最多 ${result.caps?.normalBlocks ?? 4} 处）`);\n    lines.push(`**仅关联词命中**：${relatedFiles.length} 个文件 / ${result.totals.relatedBlocks} 处（每文件最多 ${result.caps?.strongBlocks ?? 2} 处）`);");
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.12"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
fs.writeFileSync("README.md",fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.11`","- 版本：`0.5.12`"),"utf8");
console.log("0.5.12 counts/caps");
