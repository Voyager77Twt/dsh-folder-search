import fs from "node:fs";
let r=fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.52`","- 版本：`0.5.53`"); fs.writeFileSync("README.md",r,"utf8");
let p=fs.readFileSync("package.json","utf8").replace('"version": "0.5.52"','"version": "0.5.53"'); fs.writeFileSync("package.json",p,"utf8");
for (const file of ["tests/_static-audit.mjs","tests/_detailed-static.mjs","tests/detailed-static.mjs"]) {
  if(!fs.existsSync(file)) continue;
  let t=fs.readFileSync(file,"utf8").replaceAll('0.5.52','0.5.53');
  t=t.replace('=== 45, "48 settings keys"','=== 48, "48 settings keys"');
  t=t.replace('keys.length === 45, "45 settings keys"','keys.length === 48, "48 settings keys"');
  fs.writeFileSync(file,t,"utf8");
}
fs.copyFileSync("tests/_detailed-static.mjs","tests/detailed-static.mjs");
console.log("0.5.53");
