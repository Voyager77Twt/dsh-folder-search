import fs from "node:fs";
let t=fs.readFileSync("tests/_static-audit.mjs","utf8");
t=t.replace('ok(pkg.version === "0.5.19", "package.version 0.5.19");','ok(pkg.version === "0.5.20", "package.version 0.5.20");');
fs.writeFileSync("tests/_static-audit.mjs",t,"utf8");
