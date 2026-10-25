import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
if(!c.includes("const customKeys = Object.keys")){
  c=c.replace("      const allFiles = settings.normalMaxFiles === 'all';","      const allFiles = settings.normalMaxFiles === 'all';\n      const customKeys = Object.keys(settings.customAssociations || {});\n      const customDisabled = new Set(Array.isArray(settings.customDisabled) ? settings.customDisabled : []);");
}
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.14"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
fs.writeFileSync("README.md",fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.13`","- 版本：`0.5.14`"),"utf8");
console.log("custom UI state + 0.5.14");
