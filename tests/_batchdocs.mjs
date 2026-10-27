import fs from "node:fs";
let r=fs.readFileSync("README.md","utf8");
r=r.replace("- 版本：`0.5.22`","- 版本：`0.5.23`");
r=r.replace("第一次填写路径并保存就会开始建库；已有缓存时只补新增/改动文件。","第一次填写路径并保存就会开始建库；已有缓存时只补新增/改动文件。\n\n旧版 `.doc/.rtf` 会先用一个 Word 会话批量转 PDF，再并行抽取；`.docx/.pdf/.xlsx` 等按「建库并发数」并行。");
fs.writeFileSync("README.md",r,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.23"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
let t=fs.readFileSync("tests/_static-audit.mjs","utf8").replace('"package.version 0.5.22"','"package.version 0.5.23"').replace('pkg.version === "0.5.22"','pkg.version === "0.5.23"');
fs.writeFileSync("tests/_static-audit.mjs",t,"utf8");
console.log("0.5.23 batch docs");
