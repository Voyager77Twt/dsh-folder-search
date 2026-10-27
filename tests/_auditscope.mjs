import fs from "node:fs";
let t=fs.readFileSync("tests/_static-audit.mjs","utf8");
t=t.replace('const searchText = fs.readFileSync(root + "/lib/search.js", "utf8") + fs.readFileSync(root + "/lib/outline.js", "utf8");','const searchText = fs.readFileSync(root + "/lib/search.js", "utf8") + fs.readFileSync(root + "/lib/outline.js", "utf8") + fs.readFileSync(root + "/lib/index.js", "utf8") + fs.readFileSync(root + "/lib/settings-host.js", "utf8");');
fs.writeFileSync("tests/_static-audit.mjs",t,"utf8");
console.log("audit scope updated");
