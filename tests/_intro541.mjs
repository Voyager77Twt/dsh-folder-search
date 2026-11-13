import fs from "node:fs";
let p="package.json"; let c=fs.readFileSync(p,"utf8");
c=c.replace('"version": "0.5.40"','"version": "0.5.41"');
c=c.replace('"description": "本地文件夹检索模式：在本地 Word / PDF / PPT / Excel 文件夹里按关键词检索并给出可打开的位置，读取完整题目，导出组卷 Word。"','"description": "本地文件夹检索模式：在本地 Word / PDF / PPT / Excel 题库中按关键词和关联词定位文件、页码/段落与题号；支持四种搜索模式、自定义词表、零命中兜底、索引缓存、组卷导出，以及 ZIP/文本限制、解析隔离和 Office 宏防护。"');
fs.writeFileSync(p,c,"utf8");
let t=fs.readFileSync("tests/_static-audit.mjs","utf8");
t=t.replace('ok(pkg.version === "0.5.40", "package.version 0.5.40");','ok(pkg.version === "0.5.41", "package.version 0.5.41");');
fs.writeFileSync("tests/_static-audit.mjs",t,"utf8");
console.log("0.5.41 intro");
