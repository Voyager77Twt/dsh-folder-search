import fs from "node:fs";
let p="lib/indexer.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("    if (entry.isDirectory()) total += await pathSize(full);","    if (entry.isDirectory()) {\n      // 旧版 Office 转换的临时 PDF 不计入文本缓存上限。\n      if (entry.name.startsWith('legacy-pdf-')) continue;\n      total += await pathSize(full);\n    }");
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.29"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
fs.writeFileSync("README.md",fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.28`","- 版本：`0.5.29`").replace("建库过程中旧版 `.doc` 会生成 `legacy-pdf-*` 临时 PDF，这部分**不算文本索引**，建库结束会删除；","建库过程中旧版 `.doc` 会生成 `legacy-pdf-*` 临时 PDF，这部分**不算文本索引，也不计入 250 MB 缓存上限**，建库结束会删除；"),"utf8");
console.log("0.5.29 cache cap");
