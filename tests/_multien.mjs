import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
const start=c.indexOf("    const EN = "); const end=c.indexOf("\n    const isEnglish",start);
const en=JSON.parse(c.slice(start+"    const EN = ".length,end).trim().replace(/;$/,''));
en['一个或多个题库文件夹的绝对路径，用逗号或换行分隔。每个题库单独建索引；删除其中一个不会影响其他题库的缓存。']='One or more absolute library folders, separated by commas or new lines. Each library gets its own index; removing one does not affect the others.';
c=c.slice(0,start)+"    const EN = "+JSON.stringify(en,null,2)+";"+c.slice(end);
fs.writeFileSync(p,c,"utf8");
console.log("library EN note");
