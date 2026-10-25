import fs from "node:fs";
const p="package.json"; const pkg=JSON.parse(fs.readFileSync(p,"utf8")); pkg.version="0.2.3"; fs.writeFileSync(p,JSON.stringify(pkg,null,2)+"\n","utf8");
const r=fs.readFileSync("README.md","utf8").replace("- 版本：`0.2.2`","- 版本：`0.2.3`"); fs.writeFileSync("README.md",r,"utf8");
console.log(pkg.version);
