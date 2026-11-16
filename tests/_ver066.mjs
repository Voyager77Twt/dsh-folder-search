import fs from "node:fs";
let p="README.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("* **搜索前询问我**：模型用选择框询问，选项固定包含“全部库”和当前配置的每个完整库路径，用户只选不输入。","* **搜索前询问我**：模型用多选选择框询问，选项固定包含“全部库”和当前配置的每个完整库路径，用户只选不输入。可以选多个具体库；选“全部库”会覆盖其他选择；把所有具体库都选上时也按全部库处理。");
fs.writeFileSync(p,c,"utf8");
p="README.en.md"; c=fs.readFileSync(p,"utf8");
c=c.replace("* **Ask before searching**: the model asks with a choice list containing “all libraries” and every configured library path; the user only selects, never types.","* **Ask before searching**: the model asks with a multi-select list containing “all libraries” and every configured library path; the user only selects, never types. Multiple specific libraries can be selected; choosing “all libraries” overrides other choices, and selecting every library is also treated as all.");
fs.writeFileSync(p,c,"utf8");
for (const file of ["README.md","README.en.md"]) {
  let r=fs.readFileSync(file,"utf8").replaceAll("0.6.5","0.6.6"); fs.writeFileSync(file,r,"utf8");
}
let pkg=fs.readFileSync("package.json","utf8").replace('"version": "0.6.5"','"version": "0.6.6"'); fs.writeFileSync("package.json",pkg,"utf8");
for (const file of ["tests/_static-audit.mjs","tests/_detailed-static.mjs","tests/detailed-static.mjs"]) {
  if(!fs.existsSync(file)) continue;
  let t=fs.readFileSync(file,"utf8").replaceAll("0.6.5","0.6.6"); fs.writeFileSync(file,t,"utf8");
}
fs.copyFileSync("tests/_detailed-static.mjs","tests/detailed-static.mjs");
console.log("0.6.6");
