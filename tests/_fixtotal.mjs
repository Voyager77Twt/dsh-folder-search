import fs from "node:fs";
let p="lib/indexer.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("      workTotal,\n      processed,","      workTotal: totalWork,\n      processed,");
fs.writeFileSync(p,c,"utf8");
