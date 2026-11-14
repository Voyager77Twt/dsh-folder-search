import fs from "node:fs";
for (const file of ["README.md","README.en.md"]) {
  let c=fs.readFileSync(file,"utf8");
  c=c.replace("详细静态/集成审计（119 项）","详细静态/集成审计（125 项）");
  c=c.replace("detailed static/integration audit (119 checks)","detailed static/integration audit (125 checks)");
  fs.writeFileSync(file,c,"utf8");
}
console.log("README test count");
