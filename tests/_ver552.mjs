import fs from "node:fs";
let r=fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.51`","- 版本：`0.5.52`");
fs.writeFileSync("README.md",r,"utf8");
let p=fs.readFileSync("package.json","utf8").replace('"version": "0.5.51"','"version": "0.5.52"'); fs.writeFileSync("package.json",p,"utf8");
for (const file of ["tests/_static-audit.mjs","tests/_detailed-static.mjs","tests/detailed-static.mjs"]) {
  if(!fs.existsSync(file)) continue;
  let t=fs.readFileSync(file,"utf8").replaceAll('0.5.51','0.5.52');
  fs.writeFileSync(file,t,"utf8");
}
fs.copyFileSync("tests/_detailed-static.mjs","tests/detailed-static.mjs");
console.log("0.5.52");
