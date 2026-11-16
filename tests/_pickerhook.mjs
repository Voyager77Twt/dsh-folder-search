import fs from "node:fs";
let p="tests/_detailed-static.mjs"; let c=fs.readFileSync(p,"utf8");
c=c.replace("const values = [settings, null, '', false, '', null, false, '', ''];","const values = [settings, null, '', '', '', '', false, false, mockIndexStatus, false, '', ''];");
c=c.replace("const values = [settings, null, '', '', false, '', false, mockIndexStatus, false, '', ''];","const values = [settings, null, '', '', '', '', false, false, mockIndexStatus, false, '', ''];");
fs.writeFileSync(p,c,"utf8");
fs.copyFileSync(p,"tests/detailed-static.mjs");
console.log("picker hook mock");
