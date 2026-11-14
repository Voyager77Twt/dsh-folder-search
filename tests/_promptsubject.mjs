import fs from "node:fs";
let p="cordis.patch.yml"; let c=fs.readFileSync(p,"utf8");
c=c.replace("工具默认会用配置里的关联词扩展，你只需在必要时手动补词。","通用词表始终启用；学科词表只有你显式选择 subject 时才启用；模型给的 strongTerms/generalTerms 继续作为扩展召回。");
c=c.replace("不限学科。不要填父类/领域词，不要为补词再搜第二次。","不限学科。可选 subject：题目明显属于语文/数学/英语/物理/化学/生物/历史/地理/政治时选一个，不确定就省略；不要硬选。不要填父类/领域词，不要为补词再搜第二次。");
fs.writeFileSync(p,c,"utf8");
console.log("prompt subject");
