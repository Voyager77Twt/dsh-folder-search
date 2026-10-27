import fs from "node:fs";
let r=fs.readFileSync("README.md","utf8");
r=r.replace("- 版本：`0.5.21`","- 版本：`0.5.22`");
r=r.replace("| 目录默认文件数 | 60 | outline 一次列多少文件，只影响目录输出 |","| 建库并发数 | 3 | docx/pdf/xlsx 等并行抽取；.doc/.ppt/.rtf 仍串行；1–8 |\n| 目录默认文件数 | 60 | outline 一次列多少文件，只影响目录输出 |");
fs.writeFileSync("README.md",r,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.22"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
let t=fs.readFileSync("tests/_static-audit.mjs","utf8")
  .replace('"package.version 0.5.21"','"package.version 0.5.22"')
  .replace('pkg.version === "0.5.21"','pkg.version === "0.5.22"')
  .replace("ok(keys.length === 30, \"30 settings keys, got \" + keys.length);","ok(keys.length === 31, \"31 settings keys, got \" + keys.length);");
fs.writeFileSync("tests/_static-audit.mjs",t,"utf8");
console.log("0.5.22 docs");
