import fs from "node:fs";
let p="package.json"; let c=fs.readFileSync(p,"utf8");
c=c.replace('"version": "0.5.55"','"version": "0.6.0-beta.1"');
c=c.replace('    "README.en.md",\n    "LICENSE"','    "README.en.md",\n    "RELEASE-NOTES.md",\n    "LICENSE"');
fs.writeFileSync(p,c,"utf8");
for (const file of ["README.md","README.en.md"]) {
  let r=fs.readFileSync(file,"utf8");
  r=r.replaceAll("0.5.55","0.6.0-beta.1");
  fs.writeFileSync(file,r,"utf8");
}
for (const file of ["tests/_static-audit.mjs","tests/_detailed-static.mjs","tests/detailed-static.mjs"]) {
  if(!fs.existsSync(file)) continue;
  let t=fs.readFileSync(file,"utf8").replaceAll("0.5.55","0.6.0-beta.1");
  fs.writeFileSync(file,t,"utf8");
}
fs.copyFileSync("tests/_detailed-static.mjs","tests/detailed-static.mjs");
console.log("version beta");
