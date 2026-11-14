import fs from "node:fs";
let p="README.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("| 强关联输出·最多文件数 | 全部 |","| 强关联输出·最多文件数 | 8 |");
c=c.replace("| 强关联输出·片段长度 | 45 |","| 强关联输出·片段长度 | 60 |");
c=c.replace("| 一般关联词数量上限 | 4 |","| 一般关联词数量上限 | 1 |");
c=c.replace("| 最终输出文件数 | 60 |","| 最终输出文件数 | 30 |");
fs.writeFileSync(p,c,"utf8");
console.log("README output defaults");
