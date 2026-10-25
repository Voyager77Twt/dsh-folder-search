import fs from "node:fs";
let p="lib/index.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("description: '模型自己想的强关联概念（不是同义词）；数量由设置页“强关联词上限”限制。'","description: '模型自己想的强关联专名（人物/旧称/别名/缩写，不是领域词）；数量由设置页第3步上限限制，关闭第3步则忽略。'");
c=c.replace("description: '模型补充的一般关联词；数量由设置页“关联词数量上限”限制（和自动词表共用）。'","description: '模型补充的一般关联词；数量由设置页第4步“关联词数量上限”限制，关闭第5步则忽略。'");
fs.writeFileSync(p,c,"utf8");
console.log("tool descriptions updated");
