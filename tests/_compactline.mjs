import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
const lines=c.split('\n');
const i=lines.findIndex((line)=>line.includes('文件较多'));
if(i<0) throw new Error('summary line missing');
lines[i]="    if (result.truncated && !result.listAll) lines.push(`（默认只列前 ${result.totals.shownFiles} 个文件；另有 ${Math.max(0, result.totals.files - result.totals.shownFiles)} 个未列出。需要完整列表请明确说“全部列出”。）`);";
fs.writeFileSync(p,lines.join('\n'),"utf8");
console.log("summary replaced");
