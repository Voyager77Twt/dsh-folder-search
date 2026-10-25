import fs from "node:fs";
let p="README.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("| 步骤 4·自动关联词扩展 | 开 | 内置词表“有机→烃/醇/醛…”；可编辑自定义词表，同名覆盖、追加新词 |","| 步骤 4·自动关联词扩展 | 开 | 内置词表；自定义词表中同一关键词优先，剩余名额用内置词表补齐 |");
fs.writeFileSync(p,c,"utf8");
