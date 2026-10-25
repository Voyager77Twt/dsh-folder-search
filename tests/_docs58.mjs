import fs from "node:fs";
let p="README.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("| 普通·输出文件数 | 全部 | 普通关键词一次列多少文件；“全部”最全也最贵 |\n| 普通·每文件位置数 | 4 | 每个文件最多列几处命中；总数仍显示 |\n| 普通·片段长度 | 90 | 关键词前后截取多少字 |", "| 步骤 2 的原词输出 | 全部 / 4 / 90 | 只作用于直接命中原词的文件：文件数 / 每文件位置数 / 片段长度 |");
c=c.replace("| 步骤 4/5 的关联词输出 | 全部 / 2 / 45 | 自动词表与一般关联共用：最多文件数 / 每文件位置数 / 片段长度 |", "| 步骤 4/5 的关联词输出 | 全部 / 2 / 45 | 只作用于仅关联词命中的文件；与第 2 步的原词输出分开 |");
c=c.replace("| 步骤 1·自动补索引 | 开 |", "| 步骤 1·自动补索引 | 开 |");
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.8"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
fs.writeFileSync("README.md",fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.7`","- 版本：`0.5.8`"),"utf8");
console.log("0.5.8 docs");
