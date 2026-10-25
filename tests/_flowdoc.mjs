import fs from "node:fs";
let p="README.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("| 步骤 4 的扩展检索输出 | 8 / 2 / 45 | 仅第 4 步触发时：最多文件数 / 每文件位置数 / 片段长度 |","| 步骤 4/5 的关联词输出 | 8 / 2 / 45 | 自动词表与一般关联共用：最多文件数 / 每文件位置数 / 片段长度 |");
c=c.replace("| 步骤 5·一般关联词 | 开 | 模型补充的一般关联词；不新增文件，只在已命中文件里补段落 |","| 步骤 5·一般关联词 | 开 | 模型补充的一般关联词；与第 4 步共用数量上限和输出上限，不新增文件，只补已命中文件段落 |");
c=c.replace("> 最低花费：只保留步骤 1–2；要更全再逐步打开 3、4、5。打开越多，检索轮次和输出越大。","> 每个启用的步骤执行 1 次，按 1 → 2 → 3/4/5 → 6 → 7 → 8 → 9 合并扫描；不会自动二次补搜。最低花费：只保留步骤 1–2；要更全再逐步打开 3、4、5。");
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.4"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
fs.writeFileSync("README.md",fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.3`","- 版本：`0.5.4`"),"utf8");
console.log("0.5.4 docs");
