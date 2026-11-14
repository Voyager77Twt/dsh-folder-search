import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("'一个 docx/pptx/xlsx 最多允许多少个压缩条目。'","'一个 Office 文件或 .zip 压缩包最多允许多少个条目。'");
c=c.replace("'整个压缩包解压后的总上限；超过会中止该文件。'","'一个压缩包解压后的总上限；嵌套压缩包另有独立的全树预算。'");
// Add English translations for changed notes (leave old keys harmless)
const start=c.indexOf("    const EN = "); const end=c.indexOf("\n    const isEnglish",start);
const en=JSON.parse(c.slice(start+"    const EN = ".length,end).trim().replace(/;$/,''));
Object.assign(en,{
  '一个 Office 文件或 .zip 压缩包最多允许多少个条目。':'Maximum entries allowed in one Office file or .zip archive.',
  '一个压缩包解压后的总上限；嵌套压缩包另有独立的全树预算。':'Total extracted size for one archive; nested archives use a separate tree-wide budget.'
});
c=c.slice(0,start)+"    const EN = "+JSON.stringify(en,null,2)+";"+c.slice(end);
fs.writeFileSync(p,c,"utf8");
console.log("archive security copy");
