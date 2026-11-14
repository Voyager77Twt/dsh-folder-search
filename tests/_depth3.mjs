import fs from "node:fs";
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8"); c=c.replace("  archiveMaxDepth: 2,","  archiveMaxDepth: 3,"); fs.writeFileSync(p,c,"utf8");
p="lib/client.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("value: num(settings.archiveMaxDepth, 2), onChange: (e) => update({ archiveMaxDepth: Math.max(1, Math.min(10, num(e.target.value, 2))) })","value: num(settings.archiveMaxDepth, 3), onChange: (e) => update({ archiveMaxDepth: Math.max(1, Math.min(10, num(e.target.value, 3))) })");
fs.writeFileSync(p,c,"utf8");
for (const file of ["README.md","README.en.md"]) {
  let r=fs.readFileSync(file,"utf8");
  r=r.replace("| 压缩包最大深度 | 2 |","| 压缩包最大深度 | 3 |").replace("| Max archive depth | 2 |","| Max archive depth | 3 |");
  r=r.replace(/0\.5\.54/g,"0.5.55");
  fs.writeFileSync(file,r,"utf8");
}
let pkg=fs.readFileSync("package.json","utf8").replace('"version": "0.5.54"','"version": "0.5.55"'); fs.writeFileSync("package.json",pkg,"utf8");
for (const file of ["tests/_static-audit.mjs","tests/_detailed-static.mjs","tests/detailed-static.mjs"]) {
  if(!fs.existsSync(file)) continue;
  let t=fs.readFileSync(file,"utf8").replaceAll("0.5.54","0.5.55");
  fs.writeFileSync(file,t,"utf8");
}
fs.copyFileSync("tests/_detailed-static.mjs","tests/detailed-static.mjs");
console.log("depth 3 / 0.5.55");
