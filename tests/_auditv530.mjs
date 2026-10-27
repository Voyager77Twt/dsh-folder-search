import fs from "node:fs";
let t=fs.readFileSync("tests/_static-audit.mjs","utf8");
t=t.replace('ok(pkg.version === "0.5.29", "package.version 0.5.29");','ok(pkg.version === "0.5.30", "package.version 0.5.30");');
fs.writeFileSync("tests/_static-audit.mjs",t,"utf8");
let r=fs.readFileSync("README.md","utf8").replace("每批 60 个","每批 20 个").replace("每批 60 个","每批 20 个");
fs.writeFileSync("README.md",r,"utf8");
