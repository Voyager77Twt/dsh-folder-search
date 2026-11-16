import fs from "node:fs";
let p="README.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("|抽取文本上限（MB）|20|单文件最多保留的文本字符量，超出部分截断|","|抽取文本上限（MB）|20|按字符数截断，不是 UTF-8 字节数；约等于 20 × 1024 × 1024 个字符|");
fs.writeFileSync(p,c,"utf8");
p="README.en.md"; c=fs.readFileSync(p,"utf8");
c=c.replace("|Max extracted text (MB)|20|Text characters retained per file; excess is truncated|","|Max extracted text (MB)|20|Truncated by character count, not UTF-8 bytes; roughly 20 × 1024 × 1024 characters|");
fs.writeFileSync(p,c,"utf8");
p="lib/client.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("h('span', { style: label }, '抽取文本上限（MB）')","h('span', { style: label }, '抽取文本上限（MB，按字符计）')");
c=c.replace("note: '单个文件抽取出的文本字符上限（MB 按字符计）。'","note: '单个文件最多保留约 20 × 1024 × 1024 个字符；MB 只是易读说法，不是文件字节大小。'");
const start=c.indexOf("    const EN = "); const end=c.indexOf("\n    const isEnglish",start);
const en=JSON.parse(c.slice(start+"    const EN = ".length,end).trim().replace(/;$/,''));
Object.assign(en,{
  '抽取文本上限（MB，按字符计）':'Max extracted text (MB of characters)',
  '单个文件最多保留约 20 × 1024 × 1024 个字符；MB 只是易读说法，不是文件字节大小。':'At most about 20 × 1024 × 1024 characters per file; MB is a readable label, not the file byte size.'
});
c=c.slice(0,start)+"    const EN = "+JSON.stringify(en,null,2)+";"+c.slice(end);
fs.writeFileSync(p,c,"utf8");
console.log("MB character clarification");
