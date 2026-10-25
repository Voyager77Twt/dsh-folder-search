import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
const old=`    const directFiles = result.files.filter((file) => !file.relatedOnly);
    const relatedFiles = result.files.filter((file) => file.relatedOnly);
    lines.push(\`**直接命中（原词）**：\${directFiles.length} 个文件 / \${result.totals.directBlocks} 处（文件全部列出；每文件最多 \${result.caps?.normalBlocks ?? 4} 处）\`);
    lines.push(\`**仅关联词命中**：\${relatedFiles.length} 个文件 / \${result.totals.relatedBlocks} 处（每文件最多 \${result.caps?.strongBlocks ?? 2} 处）\`);`;
const neu=`    const directFiles = result.files.filter((file) => (file.directKeywords?.length ?? 0) > 0);
    const expandedFiles = result.files.filter((file) => file.expandedOnly);
    const relatedFiles = result.files.filter((file) => file.relatedOnly);
    lines.push(\`**直接命中（原词）**：\${directFiles.length} 个文件 / \${result.totals.directBlocks} 处（文件全部列出；每文件最多 \${result.caps?.normalBlocks ?? 4} 处）\`);
    lines.push(\`**自动扩展命中**：\${expandedFiles.length} 个文件 / \${result.totals.expandedBlocks} 处（每文件最多 \${result.caps?.assocBlocks ?? 2} 处）\`);
    lines.push(\`**仅强关联命中**：\${relatedFiles.length} 个文件 / \${result.totals.relatedBlocks} 处（每文件最多 \${result.caps?.strongBlocks ?? 2} 处）\`);`;
if(!c.includes(old)) throw new Error('render header marker missing');
c=c.replace(old,neu);
const oldSections=`    if (directFiles.length) {
      lines.push('**直接命中原词（全部列出）**');
      directFiles.forEach(renderFile);
    }
    if (relatedFiles.length) {
      lines.push('**仅关联词命中（按强关联输出上限截断）**');
      relatedFiles.forEach(renderFile);
    }`;
const newSections=`    if (directFiles.length) {
      lines.push('**直接命中原词（全部列出）**');
      directFiles.forEach(renderFile);
    }
    if (expandedFiles.length) {
      lines.push('**自动扩展命中（按关联词输出上限截断）**');
      expandedFiles.forEach(renderFile);
    }
    if (relatedFiles.length) {
      lines.push('**仅强关联命中（按强关联输出上限截断）**');
      relatedFiles.forEach(renderFile);
    }`;
if(!c.includes(oldSections)) throw new Error('render sections marker missing');
c=c.replace(oldSections,newSections);
fs.writeFileSync(p,c,"utf8");
console.log("three sections render");
