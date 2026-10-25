import fs from "node:fs";
let p="README.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("| 步骤 4·自动关联词扩展 | 开 | 内置词表“有机→烃/醇/醛…”；关闭后不扩展 |","| 步骤 4·自动关联词扩展 | 开 | 内置词表“有机→烃/醇/醛…”；可编辑自定义词表，同名覆盖、追加新词 |");
c=c.replace("| 步骤 3·强关联词 | 开 | 模型自己想的专名（人物/旧称/别名/缩写）；上限默认 1，0=禁止 |","| 步骤 3·强关联词 | 开 | 模型自检后填 1 个专名（人物/旧称/别名/缩写）；工具会降级过宽/领域词，只保留最窄 1 个 |");
c=c.replace("> 每个启用的步骤执行 1 次，按 1 → 2 → 3/4/5 → 6 → 7 → 8 → 9 合并扫描；不会自动二次补搜。",""> 每个启用的步骤执行 1 次，按 1 → 2 → 3/4/5 → 6 → 7 → 8 → 9 合并扫描；强关联词质量闸门在同一次调用内完成，不会二次补搜。");
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.5"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
fs.writeFileSync("README.md",fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.4`","- 版本：`0.5.5`"),"utf8");
console.log("0.5.5 docs");
