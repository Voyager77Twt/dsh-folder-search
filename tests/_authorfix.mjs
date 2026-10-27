import fs from "node:fs";
// package author
let p="package.json"; let pkg=JSON.parse(fs.readFileSync(p,"utf8"));
pkg.version="0.5.27";
pkg.author="七七 (Voyager77Twt)";
fs.writeFileSync(p,JSON.stringify(pkg,null,2)+"\n","utf8");
// license
let lic=fs.readFileSync("LICENSE","utf8");
lic=lic.replace(/Copyright \(c\) 2026 七七/, "Copyright (c) 2026 七七 (Voyager77Twt)");
fs.writeFileSync("LICENSE",lic,"utf8");
// README stale version references + author
let r=fs.readFileSync("README.md","utf8");
r=r.replaceAll("0.5.17","0.5.27");
r=r.replaceAll("0.5.24","0.5.27");
r=r.replace("- 许可：MIT", "- 作者：七七（Voyager77Twt）\n- 许可：MIT");
fs.writeFileSync("README.md",r,"utf8");
// static audit version
let t=fs.readFileSync("tests/_static-audit.mjs","utf8")
  .replace(/"package\.version 0\.5\.2[0-9]"/, '"package.version 0.5.27"')
  .replace(/pkg\.version === "0\.5\.2[0-9]"/, 'pkg.version === "0.5.27"');
fs.writeFileSync("tests/_static-audit.mjs",t,"utf8");
console.log("author/license/version updated");
