import fs from "node:fs";
let p="tests/_static-audit.mjs"; let c=fs.readFileSync(p,"utf8");
c=c.replace('ok(keys.length === 45, "45 settings keys, got " + keys.length);','ok(keys.length === 48, "48 settings keys, got " + keys.length);');
c=c.replace('const searchText = fs.readFileSync(root + "/lib/search.js", "utf8") + fs.readFileSync(root + "/lib/outline.js", "utf8") + fs.readFileSync(root + "/lib/index.js", "utf8") + fs.readFileSync(root + "/lib/settings-host.js", "utf8");','const searchText = fs.readFileSync(root + "/lib/search.js", "utf8") + fs.readFileSync(root + "/lib/outline.js", "utf8") + fs.readFileSync(root + "/lib/index.js", "utf8") + fs.readFileSync(root + "/lib/settings-host.js", "utf8") + fs.readFileSync(root + "/lib/extract.js", "utf8");');
fs.writeFileSync(p,c,"utf8");
console.log("base audit archive settings");
