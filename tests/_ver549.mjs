import fs from "node:fs";
let r=fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.48`","- 版本：`0.5.49`");
r=r.replace("node tests/_static-audit.mjs   # 语法、清单、设置键、路由、分类/上限/兜底","node tests/_static-audit.mjs   # 基础静态审计\nnode tests/detailed-static.mjs  # 详细静态/集成审计（102 项）");
fs.writeFileSync("README.md",r,"utf8");
let p=fs.readFileSync("package.json","utf8").replace('"version": "0.5.48"','"version": "0.5.49"'); fs.writeFileSync("package.json",p,"utf8");
for (const file of ["tests/_static-audit.mjs","tests/_detailed-static.mjs","tests/detailed-static.mjs"]) {
  if(!fs.existsSync(file)) continue;
  let t=fs.readFileSync(file,"utf8");
  t=t.replaceAll('0.5.48','0.5.49');
  fs.writeFileSync(file,t,"utf8");
}
fs.copyFileSync("tests/_detailed-static.mjs","tests/detailed-static.mjs");
console.log("0.5.49 and detailed test");
