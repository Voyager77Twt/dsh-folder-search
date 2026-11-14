import fs from "node:fs";
const s=fs.readFileSync("lib/client.js","utf8");
const matches=[...s.matchAll(/'([^'\\]*(?:\\.[^'\\]*)*)'/g)].map(m=>m[1]).filter(x=>/[\u4e00-\u9fff]/.test(x));
console.log(matches.length, [...new Set(matches)].length);
console.log([...new Set(matches)].slice(0,20));
