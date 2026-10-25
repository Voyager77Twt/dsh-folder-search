import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  const totals = {\n    files: totalFilesHit,\n    blocks: totalBlocksHit,\n    shownFiles: results.length,\n    shownBlocks: results.reduce((sum, file) => sum + file.blocks.length, 0),\n  };",
"  const totals = {\n    files: totalFilesHit,\n    blocks: totalBlocksHit,\n    directFiles: directResults.length,\n    relatedFiles: relatedResults.length,\n    directBlocks: directResults.reduce((sum, file) => sum + file.blocksHit, 0),\n    relatedBlocks: relatedResults.reduce((sum, file) => sum + file.blocksHit, 0),\n    shownFiles: results.length,\n    shownBlocks: results.reduce((sum, file) => sum + file.blocks.length, 0),\n  };");
const oldRender=`    lines.push(\`**命中**：\${result.totals.files} 个文件 / \${result.totals.blocks} 处（显示 \${result.totals.shownFiles} 个文件 / \${result.totals.shownBlocks} 处）\`);
    result.files.forEach((file, index) => {
      lines.push(\`\${index + 1}. \${markdownLink(file.name, file.path)}（\${kindLabel(file.kind)}，\${file.blocksHit} 处\${file.relatedOnly ? '；仅关联词命中' : ''}\${file.aliases?.length ? \`；相同内容另有 \${file.aliases.length} 个\` : ''}）\`);
      for (const block of file.blocks) {
        lines.push(\`   - \${block.label}\${block.snippet ? \`：\${block.snippet}\` : ''}\`);
      }
      if (file.blocksHit > file.blocks.length) lines.push(\`   - …另有 \${file.blocksHit - file.blocks.length} 处未显示（可加 subpath 或更精确的关键词）\`);
    });`;
const newRender=`    const directFiles = result.files.filter((file) => !file.relatedOnly);
    const relatedFiles = result.files.filter((file) => file.relatedOnly);
    lines.push(\`**命中**：直接 \${result.totals.directFiles} 个文件 / \${result.totals.directBlocks} 处；仅关联词 \${result.totals.relatedFiles} 个文件 / \${result.totals.relatedBlocks} 处（显示 \${directFiles.length} 个直接、\${relatedFiles.length} 个关联）\`);
    const renderFile = (file, index) => {
      lines.push(\`\${index + 1}. \${markdownLink(file.name, file.path)}（\${kindLabel(file.kind)}，\${file.blocksHit} 处\${file.aliases?.length ? \`；相同内容另有 \${file.aliases.length} 个\` : ''}）\`);
      for (const block of file.blocks) {
        lines.push(\`   - \${block.label}\${block.snippet ? \`：\${block.snippet}\` : ''}\`);
      }
      if (file.blocksHit > file.blocks.length) lines.push(\`   - …另有 \${file.blocksHit - file.blocks.length} 处未显示（可加 subpath 或更精确的关键词）\`);
    };
    if (directFiles.length) {
      lines.push('**直接命中原词（全部列出）**');
      directFiles.forEach(renderFile);
    }
    if (relatedFiles.length) {
      lines.push('**仅关联词命中（按强关联输出上限截断）**');
      relatedFiles.forEach(renderFile);
    }`;
if(!c.includes(oldRender)) throw new Error('render block marker missing');
c=c.replace(oldRender,newRender);
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.11"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
fs.writeFileSync("README.md",fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.10`","- 版本：`0.5.11`"),"utf8");
console.log("0.5.11 split render");
