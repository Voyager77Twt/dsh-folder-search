import fs from "node:fs";
let p="tests/_static-audit.mjs"; let c=fs.readFileSync(p,"utf8");
c=c.replace('ok(keys.length === 48, "48 settings keys, got " + keys.length);','ok(keys.length === 49, "49 settings keys, got " + keys.length);');
fs.writeFileSync(p,c,"utf8");
console.log("static key count");
