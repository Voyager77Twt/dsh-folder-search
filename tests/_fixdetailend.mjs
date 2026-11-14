import fs from "node:fs";
let p="tests/_detailed-static.mjs"; let c=fs.readFileSync(p,"utf8");
c=c.replace('console.log(JSON.stringify({ ok: failures.length === 0", passCount: passes.length, failures }, null, 2));','console.log(JSON.stringify({ ok: failures.length === 0, passCount: passes.length, failures }, null, 2));');
fs.writeFileSync(p,c,"utf8");
