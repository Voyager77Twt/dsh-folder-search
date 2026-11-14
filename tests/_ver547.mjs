import fs from "node:fs";
let r=fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.46`","- 版本：`0.5.47`");
fs.writeFileSync("README.md",r,"utf8");
let p=fs.readFileSync("package.json","utf8").replace('"version": "0.5.46"','"version": "0.5.47"'); fs.writeFileSync("package.json",p,"utf8");
let t=fs.readFileSync("tests/_static-audit.mjs","utf8");
t=t.replace('ok(pkg.version === "0.5.46", "package.version 0.5.46");','ok(pkg.version === "0.5.47", "package.version 0.5.47");');
fs.writeFileSync("tests/_static-audit.mjs",t,"utf8");
console.log("0.5.47");
