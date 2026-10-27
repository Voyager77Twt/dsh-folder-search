import fs from "node:fs";
let p="lib/index.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  const config = { ...resolved, cacheDir: settings.cacheDir ? path.resolve(settings.cacheDir) : resolved.cacheDir };","  const config = { ...resolved, cacheDir: settings.cacheDir ? path.resolve(settings.cacheDir) : resolved.cacheDir, indexConcurrency: settings.indexConcurrency };");
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.25"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
fs.writeFileSync("README.md",fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.24`","- 版本：`0.5.25`"),"utf8");
console.log("0.5.25 concurrency wiring");
