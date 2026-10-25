import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("      const allFiles = settings.normalMaxFiles === 'all';","      const allFiles = settings.normalMaxFiles === 'all';\n      const assocAll = settings.expandMaxFiles === 'all' || Number(settings.expandMaxFiles) >= 5000;");
c=c.replace("checked: settings.expandMaxFiles === 'all', onChange: (e) => update({ expandMaxFiles: e.target.checked ? 'all' : 20 })","checked: assocAll, onChange: (e) => update({ expandMaxFiles: e.target.checked ? 'all' : 20 })");
c=c.replace("disabled: settings.expandMaxFiles === 'all', value: settings.expandMaxFiles === 'all' ? '' : num(settings.expandMaxFiles, 20)","disabled: assocAll, value: assocAll ? '' : num(settings.expandMaxFiles, 20)");
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.7"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
fs.writeFileSync("README.md",fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.6`","- 版本：`0.5.7`"),"utf8");
console.log("0.5.7 compat");
