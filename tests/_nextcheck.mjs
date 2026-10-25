import fs from "node:fs";
const dir=process.env.LOCALAPPDATA+"\\dsh-library-search\\legacy-pdf-build";
const items=JSON.parse(fs.readFileSync(dir+"\\list.json","utf8"));
let missing=0; let first=null;
for(const it of items){ if(!fs.existsSync(it.out)){ missing++; if(!first) first=it; } }
console.log("total",items.length,"missing",missing);
if(first) console.log("first missing src:", first.src);
const idx=items.findIndex(it=>!fs.existsSync(it.out));
if(idx>=0){ console.log("next 5:"); for(const it of items.slice(idx, idx+5)) console.log(fs.existsSync(it.out)?"DONE":"MISS", it.src); }
