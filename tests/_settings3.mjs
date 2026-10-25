import fs from "node:fs";
const p="package.json"; const pkg=JSON.parse(fs.readFileSync(p,"utf8"));
pkg.version="0.3.0";
pkg.exports["./client"]="./lib/client.js";
pkg.exports["./settings-host"]="./lib/settings-host.js";
pkg.dsh={ manifestVersion:1, bundle:{patch:"./cordis.patch.yml"}, harnessRange:">=0.2.0-rc.2", client:{platform:"web",immediately:true,inject:[]} };
fs.writeFileSync(p,JSON.stringify(pkg,null,2)+"\n","utf8");
let y=fs.readFileSync("cordis.patch.yml","utf8");
if(!y.includes("library-search-settings-host")){
  y += "\n- insert:\n    - id: library-search-settings-host\n      name: 'dsh-library-search/settings-host'\n";
  fs.writeFileSync("cordis.patch.yml",y,"utf8");
}
const rd=fs.readFileSync("README.md","utf8").replace("- 版本：`0.2.6`","- 版本：`0.3.0`");
fs.writeFileSync("README.md",rd,"utf8");
console.log("0.3.0 package+patch");
