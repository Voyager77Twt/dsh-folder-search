import fs from "node:fs";
let p="lib/index.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("export function apply(ctx, config) {\n  const resolved = normalizeConfig(config);\n  registerSettingsRoute(ctx);","export function apply(ctx, config) {\n  const resolved = normalizeConfig(config);\n  registerSettingsRoute(ctx);\n  if (config && config.settingsOnly === true) return;");
fs.writeFileSync(p,c,"utf8");
let y=fs.readFileSync("cordis.patch.yml","utf8");
if(!y.includes("library-search-settings-host")){
  y += "\n- insert:\n    - id: library-search-settings-host\n      name: 'dsh-library-search'\n      config:\n        settingsOnly: true\n";
  fs.writeFileSync("cordis.patch.yml",y,"utf8");
}
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.3.2"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
const rd=fs.readFileSync("README.md","utf8").replace("- 版本：`0.3.1`","- 版本：`0.3.2`"); fs.writeFileSync("README.md",rd,"utf8");
console.log("0.3.2 host settings row (main package)");
