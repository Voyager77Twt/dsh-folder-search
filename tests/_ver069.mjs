import fs from "node:fs";
for (const file of ["README.md","README.en.md"]) {
  let c=fs.readFileSync(file,"utf8").replaceAll("0.6.8","0.6.9"); fs.writeFileSync(file,c,"utf8");
}
let p=fs.readFileSync("package.json","utf8").replace('"version": "0.6.8"','"version": "0.6.9"'); fs.writeFileSync("package.json",p,"utf8");
for (const file of ["tests/_static-audit.mjs","tests/_detailed-static.mjs","tests/detailed-static.mjs"]) {
  if(!fs.existsSync(file)) continue;
  let t=fs.readFileSync(file,"utf8").replaceAll("0.6.8","0.6.9"); fs.writeFileSync(file,t,"utf8");
}
fs.copyFileSync("tests/_detailed-static.mjs","tests/detailed-static.mjs");
console.log("0.6.9");
