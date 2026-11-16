import fs from "node:fs";
let p="README.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("1. 打开 设置 → **本地搜索设置**；","1. 打开 设置 → **本地搜索设置**；"); // no-op
c=c.replace("在「数据库与索引库位置」填写题库文件夹的绝对路径；","在「数据库与索引库位置」填写题库文件夹的绝对路径，或点右侧的「选择文件夹」；");
c=c.replace("| 网络 | 建索引不需要；搜索需要 |","| 网络 | 建索引不需要；搜索需要 |");
c=c.replace("「题库位置」支持多个绝对路径，用逗号或换行分隔：","「题库位置」支持多个绝对路径，用逗号或换行分隔，也可以点「选择文件夹」逐个添加：");
fs.writeFileSync(p,c,"utf8");
p="README.en.md"; c=fs.readFileSync(p,"utf8");
c=c.replace("2. Enter one or more absolute library paths under **Database and index location**;","2. Enter one or more absolute library paths under **Database and index location**, or click **Choose folder**;");
c=c.replace("**Library path** accepts multiple absolute paths separated by commas or new lines:","**Library path** accepts multiple absolute paths separated by commas or new lines, or add them one by one with **Choose folder**:");
fs.writeFileSync(p,c,"utf8");
for (const file of ["README.md","README.en.md"]) {
  let r=fs.readFileSync(file,"utf8").replaceAll("0.6.6","0.6.7").replaceAll("126 项","126 项").replaceAll("125 项","126 项").replaceAll("125 checks","126 checks"); fs.writeFileSync(file,r,"utf8");
}
let pkg=fs.readFileSync("package.json","utf8").replace('"version": "0.6.6"','"version": "0.6.7"'); fs.writeFileSync("package.json",pkg,"utf8");
for (const file of ["tests/_static-audit.mjs","tests/_detailed-static.mjs","tests/detailed-static.mjs"]) {
  if(!fs.existsSync(file)) continue;
  let t=fs.readFileSync(file,"utf8").replaceAll("0.6.6","0.6.7"); fs.writeFileSync(file,t,"utf8");
}
fs.copyFileSync("tests/_detailed-static.mjs","tests/detailed-static.mjs");
console.log("0.6.7");
