import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("    lines.push(`**强关联词处理**：${result.strongGate.demoted.join('、')} 过宽或非最窄，已降级为一般关联，不再带入新文件${result.strongGate.kept ? `；保留 ${result.strongGate.kept}` : '；本次未保留强关联词'}。`);","    const keptWords = Array.isArray(result.strongGate.kept) ? result.strongGate.kept : (result.strongGate.kept ? [result.strongGate.kept] : []);\n    lines.push(`**强关联词处理**：${result.strongGate.demoted.join('、')} 已降级（过宽或超出强关联词上限），不再带入新文件${keptWords.length ? `；保留 ${keptWords.join('、')}` : '；本次未保留强关联词'}。`);");
fs.writeFileSync(p,c,"utf8");
console.log("gate render updated");
