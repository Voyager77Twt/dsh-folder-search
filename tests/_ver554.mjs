import fs from "node:fs";
let r=fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.53`","- 版本：`0.5.54`"); fs.writeFileSync("README.md",r,"utf8");
let e=fs.readFileSync("README.en.md","utf8").replace("- Version: `0.5.53`","- Version: `0.5.54`"); fs.writeFileSync("README.en.md",e,"utf8");
let p=fs.readFileSync("package.json","utf8").replace('"version": "0.5.53"','"version": "0.5.54"'); fs.writeFileSync("package.json",p,"utf8");
for (const file of ["tests/_static-audit.mjs","tests/_detailed-static.mjs","tests/detailed-static.mjs"]) {
  if(!fs.existsSync(file)) continue;
  let t=fs.readFileSync(file,"utf8").replaceAll('0.5.53','0.5.54');
  fs.writeFileSync(file,t,"utf8");
}
fs.copyFileSync("tests/_detailed-static.mjs","tests/detailed-static.mjs");
console.log("0.5.54");
