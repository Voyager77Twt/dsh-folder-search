import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
const start=c.indexOf("    const EN = "); const end=c.indexOf("\n    const isEnglish",start);
const en=JSON.parse(c.slice(start+"    const EN = ".length,end).trim().replace(/;$/,''));
for (const key of Object.keys(en)) {
  if (key.startsWith('一个或多个题库文件夹的绝对路径')) {
    en[key]='One or more absolute library folder paths, separated by commas or new lines. Example: D:\\libraries\\chinese, D:\\libraries\\math. Quick path: open the folder in Explorer, click the address bar, Ctrl+C; or Shift+right-click the folder and choose Copy as path, then remove surrounding quotes. Each library is indexed separately; removing one does not delete the others\' cache.';
  }
}
c=c.slice(0,start)+"    const EN = "+JSON.stringify(en,null,2)+";"+c.slice(end);
fs.writeFileSync(p,c,"utf8");
console.log("English note paths");
