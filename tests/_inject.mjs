import fs from "node:fs";
let p="lib/index.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("export const inject = ['tools'];","export const inject = ['tools', 'webServer'];");
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.3.7"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
const rd=fs.readFileSync("README.md","utf8").replace("- 版本：`0.3.6`","- 版本：`0.3.7`"); fs.writeFileSync("README.md",rd,"utf8");
console.log("0.3.7 inject webServer");
