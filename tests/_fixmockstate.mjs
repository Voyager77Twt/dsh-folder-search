import fs from "node:fs";
let p="tests/_detailed-static.mjs"; let c=fs.readFileSync(p,"utf8");
c=c.replace("const values = [settings, null, '', false, '', mockIndexStatus, false, '', ''];","const values = [settings, null, '', false, '', false, mockIndexStatus, false, '', ''];");
fs.writeFileSync(p,c,"utf8");
