import fs from "node:fs";
const p="package.json"; const pkg=JSON.parse(fs.readFileSync(p,"utf8"));
pkg.version="0.2.1";
fs.writeFileSync(p,JSON.stringify(pkg,null,2)+"\n","utf8");
console.log(pkg.version);
