import fs from "node:fs";
let p="README.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("- 版本：`0.5.41`","- 版本：`0.5.42`");
fs.writeFileSync(p,c,"utf8");
p="package.json"; c=fs.readFileSync(p,"utf8"); c=c.replace('"version": "0.5.41"','"version": "0.5.42"'); fs.writeFileSync(p,c,"utf8");
let t=fs.readFileSync("tests/_static-audit.mjs","utf8");
t=t.replace('ok(pkg.version === "0.5.41", "package.version 0.5.41");','ok(pkg.version === "0.5.42", "package.version 0.5.42");');
fs.writeFileSync("tests/_static-audit.mjs",t,"utf8");
console.log("0.5.42");
