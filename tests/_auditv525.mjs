import fs from "node:fs";
let t=fs.readFileSync("tests/_static-audit.mjs","utf8");
t=t.replace('ok(pkg.version === "0.5.20", "package.version 0.5.20");','ok(pkg.version === "0.5.25", "package.version 0.5.25");');
t=t.replace('ok(keys.length === 30, "30 settings keys, got " + keys.length);','ok(keys.length === 31, "31 settings keys, got " + keys.length);');
fs.writeFileSync("tests/_static-audit.mjs",t,"utf8");
