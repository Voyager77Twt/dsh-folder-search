import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
const old=`    const directFiles = result.files.filter((file) => (file.directKeywords?.length ?? 0) > 0);
    const expandedFiles = result.files.filter((file) => file.expandedOnly);
    const relatedFiles = result.files.filter((file) => file.relatedOnly);
    const countBlocks = (files) => files.reduce((sum, file) => sum + file.blocks.length, 0);
    lines.push(\`**直接命中（原词）**：\${result.totals.directFiles} 个文件 / \${result.totals.directBlocks} 处（显示 \${directFiles.length} 个 / \${countBlocks(directFiles)} 处；每文件最多 \${result.caps?.normalBlocks ?? 4} 处）\`);
    lines.push(\`**自动扩展命中**：\${result.totals.expandedFiles} 个文件 / \${result.totals.expandedBlocks} 处（显示 \${expandedFiles.length} 个 / \${countBlocks(expandedFiles)} 处；每文件最多 \${result.caps?.assocBlocks ?? 2} 处）\`);
    lines.push(\`**仅强关联命中**：\${result.totals.relatedFiles} 个文件 / \${result.totals.relatedBlocks} 处（显示 \${relatedFiles.length} 个 / \${countBlocks(relatedFiles)} 处；每文件最多 \${result.caps?.strongBlocks ?? 2} 处）\`);`;
const neu=`    const directFiles = result.files.filter((file) => (file.directKeywords?.length ?? 0) > 0);
    const expandedFiles = result.files.filter((file) => file.expandedOnly);
    const relatedFiles = result.files.filter((file) => file.relatedOnly);
    const generalFiles = result.files.filter((file) => file.generalOnly);
    const countBlocks = (files) => files.reduce((sum, file) => sum + file.blocks.length, 0);
    if (result.totals.fallback) {
      lines.push(\`**兜底关联命中**：自动词表 \${expandedFiles.length} + 一般关联 \${generalFiles.length} 个文件（共用上限 \${result.caps?.fallbackLimit ?? 0} 个；优先自动词表）\`);
    } else {
      lines.push(\`**直接命中（原词）**：\${result.totals.directFiles} 个文件 / \${result.totals.directBlocks} 处（显示 \${directFiles.length} 个 / \${countBlocks(directFiles)} 处；每文件最多 \${result.caps?.normalBlocks ?? 4} 处）\`);
      lines.push(\`**自动扩展命中**：\${result.totals.expandedFiles} 个文件 / \${result.totals.expandedBlocks} 处（显示 \${expandedFiles.length} 个 / \${countBlocks(expandedFiles)} 处；每文件最多 \${result.caps?.assocBlocks ?? 2} 处）\`);
      lines.push(\`**强关联命中**：\${result.totals.relatedFiles} 个文件 / \${result.totals.relatedBlocks} 处（显示 \${relatedFiles.length} 个 / \${countBlocks(relatedFiles)} 处；每文件最多 \${result.caps?.strongBlocks ?? 2} 处）\`);
      if (generalFiles.length) lines.push(\`**一般关联命中**：\${result.totals.generalFiles} 个文件 / \${result.totals.generalBlocks} 处（显示 \${generalFiles.length} 个 / \${countBlocks(generalFiles)} 处；每文件最多 \${result.caps?.assocBlocks ?? 2} 处）\`);
    }`;
if(!c.includes(old)) throw new Error('render header marker missing');
c=c.replace(old,neu);
const oldSections=`    if (directFiles.length) {
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
const newSections=`    if (directFiles.length) {
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
    }`;
if(!c.includes(oldSections)) throw new Error('render sections marker missing');
c=c.replace(oldSections,newSections);
fs.writeFileSync(p,c,"utf8");
console.log("render fallback/general");
