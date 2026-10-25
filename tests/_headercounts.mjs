import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace(`    lines.push(\`**直接命中（原词）**：\${directFiles.length} 个文件 / \${result.totals.directBlocks} 处（文件全部列出；每文件最多 \${result.caps?.normalBlocks ?? 4} 处）\`);
    lines.push(\`**自动扩展命中**：\${expandedFiles.length} 个文件 / \${result.totals.expandedBlocks} 处（每文件最多 \${result.caps?.assocBlocks ?? 2} 处）\`);
    lines.push(\`**仅强关联命中**：\${relatedFiles.length} 个文件 / \${result.totals.relatedBlocks} 处（每文件最多 \${result.caps?.strongBlocks ?? 2} 处）\`);`,
`    const countBlocks = (files) => files.reduce((sum, file) => sum + file.blocks.length, 0);
    lines.push(\`**直接命中（原词）**：\${result.totals.directFiles} 个文件 / \${result.totals.directBlocks} 处（显示 \${directFiles.length} 个 / \${countBlocks(directFiles)} 处；每文件最多 \${result.caps?.normalBlocks ?? 4} 处）\`);
    lines.push(\`**自动扩展命中**：\${result.totals.expandedFiles} 个文件 / \${result.totals.expandedBlocks} 处（显示 \${expandedFiles.length} 个 / \${countBlocks(expandedFiles)} 处；每文件最多 \${result.caps?.assocBlocks ?? 2} 处）\`);
    lines.push(\`**仅强关联命中**：\${result.totals.relatedFiles} 个文件 / \${result.totals.relatedBlocks} 处（显示 \${relatedFiles.length} 个 / \${countBlocks(relatedFiles)} 处；每文件最多 \${result.caps?.strongBlocks ?? 2} 处）\`);`);
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.13"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
fs.writeFileSync("README.md",fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.12`","- 版本：`0.5.13`"),"utf8");
console.log("0.5.13 header counts");
