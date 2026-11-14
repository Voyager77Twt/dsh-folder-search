import fs from "node:fs";
const s=fs.readFileSync("lib/client.js","utf8");
const matches=[...s.matchAll(/'([^'\\]*(?:\\.[^'\\]*)*)'/g)].map(m=>m[1]).filter(x=>/[\u4e00-\u9fff]/.test(x));
const unique=[...new Set(matches)];
fs.writeFileSync(process.env.TEMP+"\\client-strings.txt", unique.map((x,i)=>String(i+1).padStart(3)+" "+x).join("\n"),"utf8");
console.log(unique.length, process.env.TEMP+"\\client-strings.txt");
