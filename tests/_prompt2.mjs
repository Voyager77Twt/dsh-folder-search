import fs from "node:fs";
let p="lib/index.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("description: '模型自己想的强关联专名（人物/旧称/别名/缩写，不是领域词）；数量由设置页第3步上限限制，关闭第3步则忽略。'","description: '模型自检：这道题的核心对象有没有“人 / 旧称 / 缩写 / 别名”？有就填 1 个专名到 strongTerms，没有就留空。强关联词 = 与主题指向同一对象的专名；不要填父类/领域词。数量由设置页第3步上限限制，关闭第3步则忽略。'");
fs.writeFileSync(p,c,"utf8");
p="cordis.patch.yml"; c=fs.readFileSync(p,"utf8");
c=c.replace("                - 第一次检索前自己先想：1 个与主题强相关的概念（不是同义词）放进 strongTerms；需要时把最多 N 个一般关联放进 generalTerms；数量受设置页上限约束。不要为补词再搜第二次，也不要把强关联词当成关键词的同义词。","                - 第一次检索前自检：这道题的核心对象有没有“人 / 旧称 / 缩写 / 别名”？有就填 1 个专名到 strongTerms，没有就留空；强关联词不是同义词，不要填父类/领域词。一般关联词放 generalTerms；数量受设置页上限约束。不要为补词再搜第二次。");
fs.writeFileSync(p,c,"utf8");
console.log("prompt strong definition");
