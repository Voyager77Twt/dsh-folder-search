import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("    const broadLimit = Math.max(2 * directFiles, Math.ceil(totalDocs * 0.2));\n    const kept = ranked.find(([, count]) => count <= broadLimit) || null;","    const broadLimit = Math.max(2 * directFiles, Math.ceil(totalDocs * 0.2));\n    const domainWord = /(工业|产业|行业|领域|技术|方法|工艺|生产|应用|研究|化学|反应|原理|实验|流程|装置|设备|材料|物质|题目|试题)$/;\n    const kept = ranked.find(([term, count]) => count <= broadLimit && !domainWord.test(term)) || null;");
fs.writeFileSync(p,c,"utf8");
console.log("domain suffix gate");
