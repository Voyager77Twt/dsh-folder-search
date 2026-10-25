import fs from "node:fs"; import { load } from "js-yaml";
const doc=load(fs.readFileSync("cordis.patch.yml","utf8"));
console.log("entries",doc.length);
for(const e of doc){ console.log(Object.keys(e), e.insert ? e.insert.map(r=>r.id+":"+r.name).join(", ") : ""); }
