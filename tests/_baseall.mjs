import fs from "node:fs";
let p="tests/_static-audit.mjs"; let c=fs.readFileSync(p,"utf8");
c=c.replace("{ ...settings, dedupe, searchMode: 'custom' }","{ ...settings, dedupe, searchMode: 'custom', all: true }");
fs.writeFileSync(p,c,"utf8");
console.log("base test explicit all");
