import fs from "node:fs";
let p="README.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("如果本机只有 **32 位 Office**","如果系统只有 **32 位 Office**");
c=c.replace("本机同时存在 64 位 Office 时仍使用默认","系统同时存在 64 位 Office 时仍使用默认");
c=c.replace("大型图片汇编 docx 可调到 200–500","大型图片密集的 docx 可调到 200–500");
c=c.replace("- `.doc` / `.ppt` / `.rtf` 转换依赖本机 Office，可能较慢；","- `.doc` / `.ppt` / `.rtf` 转换依赖本机 Office，可能较慢；这是格式限制，不是学科限制；");
fs.writeFileSync(p,c,"utf8");
console.log("README local refs");
