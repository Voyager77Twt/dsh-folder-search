import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("      const overFactor = count > directFiles * factor;","      const overFactor = directFiles > 0 && count > directFiles * factor;");
fs.writeFileSync(p,c,"utf8");
console.log("gate factor guard");
