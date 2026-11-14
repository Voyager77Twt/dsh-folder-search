import fs from "node:fs";
let p="README.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("- 版本：`0.5.42`","- 版本：`0.5.43`");
c=c.replace("- 只保留最窄的 1 个强关联词；","- 最多保留「强关联词上限」个；只有过宽或超出上限才降级；");
c=c.replace("| 强关联降级判定 | `all` | 可选：`factor`（直接命中倍数）、`files`（固定文件数）、`ratio`（全库占比）、`domain`（领域词）、`all`（任一，默认）。 |","| 强关联降级判定 | `all` | 可选：`factor`（直接命中倍数）、`files`（固定文件数）、`ratio`（全库占比）、`domain`（领域词）、`all`（任一，默认）。 |\n| 强关联领域词后缀 | 题目、试题、领域、行业、产业 | 逗号/换行分隔；留空关闭领域词降级。默认/全面模式在模式按钮下方编辑；自定义模式在第 3 步内编辑。化学或其他学科可自行追加。 |");
const oldSuffix=`领域词后缀：

\`\`\`text
工业 / 产业 / 行业 / 领域 / 技术 / 方法 / 工艺 / 生产 / 应用 / 研究 /
化学 / 反应 / 原理 / 实验 / 流程 / 装置 / 设备 / 材料 / 物质 / 题目 / 试题
\`\`\``;
const newSuffix=`默认领域词后缀：

\`\`\`text
题目 / 试题 / 领域 / 行业 / 产业
\`\`\`

只保留这些通用元词，避免“技术 / 方法 / 研究 / 应用”误伤其他学科。化学用户可在设置里追加：

\`\`\`text
化学 / 反应 / 工艺 / 原理 / 实验 / 流程 / 装置 / 设备 / 材料 / 物质
\`\`\``;
if(c.includes(oldSuffix)) c=c.replace(oldSuffix,newSuffix); else console.log("old suffix block not found");
let t=fs.readFileSync("tests/_static-audit.mjs","utf8");
t=t.replace('ok(pkg.version === "0.5.42", "package.version 0.5.42");','ok(pkg.version === "0.5.43", "package.version 0.5.43");');
t=t.replace('ok(keys.length === 43, "43 settings keys, got " + keys.length);','ok(keys.length === 44, "44 settings keys, got " + keys.length);');
fs.writeFileSync("tests/_static-audit.mjs",t,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.43"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
console.log("0.5.43 docs");
