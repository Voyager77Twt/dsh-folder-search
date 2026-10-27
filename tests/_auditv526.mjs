import fs from "node:fs";
let t=fs.readFileSync("tests/_static-audit.mjs","utf8");
t=t.replace('ok(pkg.version === "0.5.25", "package.version 0.5.25");','ok(pkg.version === "0.5.26", "package.version 0.5.26");');
fs.writeFileSync("tests/_static-audit.mjs",t,"utf8");
