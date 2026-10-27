import fs from "node:fs";
let r=fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.23`","- 版本：`0.5.24`");
fs.writeFileSync("README.md",r,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.24"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
let t=fs.readFileSync("tests/_static-audit.mjs","utf8").replace('"package.version 0.5.23"','"package.version 0.5.24"').replace('pkg.version === "0.5.23"','pkg.version === "0.5.24"');
fs.writeFileSync("tests/_static-audit.mjs",t,"utf8");
console.log("0.5.24");
