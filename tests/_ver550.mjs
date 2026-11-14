import fs from "node:fs";
let r=fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.49`","- 版本：`0.5.50`");
fs.writeFileSync("README.md",r,"utf8");
let p=fs.readFileSync("package.json","utf8").replace('"version": "0.5.49"','"version": "0.5.50"'); fs.writeFileSync("package.json",p,"utf8");
for (const file of ["tests/_static-audit.mjs","tests/_detailed-static.mjs","tests/detailed-static.mjs"]) {
  if(!fs.existsSync(file)) continue;
  let t=fs.readFileSync(file,"utf8");
  t=t.replaceAll('0.5.49','0.5.50').replaceAll('44 settings keys','45 settings keys').replaceAll('=== 44, "45 settings keys','=== 45, "45 settings keys').replaceAll('=== 44, "44 settings keys','=== 45, "45 settings keys');
  fs.writeFileSync(file,t,"utf8");
}
console.log("0.5.50 docs/tests");
