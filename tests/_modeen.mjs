import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
const start=c.indexOf("    const EN = "); const end=c.indexOf("\n    const isEnglish",start);
const en=JSON.parse(c.slice(start+"    const EN = ".length,end).trim().replace(/;$/,''));
Object.assign(en,{
  '只做原词检索：强关联、自动词表、一般关联、兜底全部关闭；最终最多 30 个文件，每文件 2 条。':'Original keywords only: strong terms, dictionaries, general terms and fallback are disabled; at most 30 files, 2 hits per file.',
  '原词 + 强关联 + 自动词表 + 一般关联全部开启；词表/一般关联最多 8 个，强关联最多 4 个；文件输出全部放开，一般关联可带入文件，输出可能很大。':'Original + strong + dictionaries + general terms all enabled; up to 8 dictionary/general terms and 4 strong terms; all file limits are open, general terms may bring files, output may be large.',
  '按当前已保存的本机设置执行，最终最多 30 个文件，每文件 2 条；需要修改时切到「自定义搜索」。':'Use saved local settings, at most 30 files and 2 hits per file; switch to Custom to edit.'
});
c=c.slice(0,start)+"    const EN = "+JSON.stringify(en,null,2)+";"+c.slice(end);
fs.writeFileSync(p,c,"utf8");
console.log("mode EN");
