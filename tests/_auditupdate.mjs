import fs from "node:fs";
let t=fs.readFileSync("tests/_static-audit.mjs","utf8");
t=t.replace('ok(pkg.version === "0.5.17", "package.version 0.5.17");','ok(pkg.version === "0.5.19", "package.version 0.5.19");');
t=t.replace('ok(keys.length === 28, "28 settings keys, got " + keys.length);','ok(keys.length === 30, "30 settings keys, got " + keys.length);');
fs.writeFileSync("tests/_static-audit.mjs",t,"utf8");
console.log("audit updated");
