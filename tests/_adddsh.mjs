import fs from "node:fs";
const p="package.json";
const pkg=JSON.parse(fs.readFileSync(p,"utf8"));
pkg.dsh={manifestVersion:1,bundle:{patch:"./cordis.patch.yml"},harnessRange:">=0.2.0-rc.2"};
fs.writeFileSync(p,JSON.stringify(pkg,null,2)+"\n","utf8");
console.log(JSON.stringify(pkg.dsh));
