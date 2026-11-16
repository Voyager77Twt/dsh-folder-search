import fs from "node:fs";
let p="tests/_detailed-static.mjs"; let c=fs.readFileSync(p,"utf8");
c=c.replace("const values = [settings, null, '', false, '', false, mockIndexStatus, false, '', ''];","const values = [settings, null, '', '', false, '', false, mockIndexStatus, false, '', ''];");
c=c.replace("check(keys.length === 48, '48 settings keys', String(keys.length));","check(keys.length === 49, '49 settings keys', String(keys.length));");
fs.writeFileSync(p,c,"utf8");
fs.copyFileSync(p,"tests/detailed-static.mjs");
console.log("client mock/keys updated");
