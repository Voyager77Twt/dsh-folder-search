import fs from "node:fs";
// search: share output caps between auto dict and general terms
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  const expanding = expand && keywords.some((keyword) => (config.associations?.[keyword]?.length ?? 0) > 0);","  const assocActive = (expand && keywords.some((keyword) => (config.associations?.[keyword]?.length ?? 0) > 0)) || generalTerms.length > 0;");
c=c.replace(/const rawMaxFiles = expanding \?/,"const rawMaxFiles = assocActive ?");
c=c.replace("expanding ? settings.expandMaxBlocksPerFile","assocActive ? settings.expandMaxBlocksPerFile");
c=c.replace("expanding ? settings.expandSnippetChars","assocActive ? settings.expandSnippetChars");
fs.writeFileSync(p,c,"utf8");
// client labels and execution counts
p="lib/client.js"; let cl=fs.readFileSync(p,"utf8");
cl=cl.replace("h('p', { style: note }, '只开 1–2 步＝最低花费；把强关联、自动词表、一般关联都打开＝最全但更贵。')","h('p', { style: note }, '一次工具调用内按 1 → 2 → 3/4/5 → 6 → 7 → 8 → 9 执行；每个启用的步骤只执行 1 次，不会自动二次补搜。只开 1–2 步＝最低花费；3/4/5 全开＝最全但更贵。')");
cl=cl.replace("index: 1, note: '搜索前检查题库更新并补索引；关闭后只查现有缓存，新文件和改动不会出现。'","index: 1, note: '执行 1 次。搜索前检查题库更新并补索引；关闭后只查现有缓存，新文件和改动不会出现。'");
cl=cl.replace("index: 2, note: '始终执行：用你给的关键词搜缓存；这是唯一必开的步骤。'","index: 2, note: '执行 1 次，始终执行：用你给的关键词搜缓存；这是唯一必开的步骤。'");
cl=cl.replace("index: 3, note: '让模型自己想一个与主题同指的专名（人物、旧称、别名、缩写、简称），不是“纯碱工业”这类领域词。开启后才接受模型的强关联词。'","index: 3, note: '执行 1 次，与第 2 步合并扫描。让模型自己想一个与主题同指的专名（人物、旧称、别名、缩写、简称），不是“纯碱工业”这类领域词；开启后才接受模型的强关联词。过宽时按普通输出截断，不再补搜。'");
cl=cl.replace("index: 4, note: '插件内置词表（有机→烃/醇/醛…）。开启后需要设置“关联词数量上限”，并单独控制扩展结果的输出量。'","index: 4, note: '执行 1 次，与第 2 步合并扫描。插件内置词表（有机→烃/醇/醛…）；开启后需要设置“关联词数量上限”，输出共用下方“关联词输出”上限。'");
cl=cl.replace("note: '仅第 4 步触发时：最多列多少文件。普通检索不用它。'","note: '第 4 步（自动词表）或第 5 步（一般关联）触发时共用：最多列多少文件。普通原词检索不用它。'");
cl=cl.replace("note: '仅第 4 步触发时：每文件最多几处位置。'","note: '第 4 步或第 5 步触发时共用：每文件最多几处位置。'");
cl=cl.replace("note: '仅第 4 步触发时：每段片段多少字。'","note: '第 4 步或第 5 步触发时共用：每段片段多少字。'");
cl=cl.replace("note: '模型补充的一般关联词；与第 4 步共用“关联词数量上限”。它不会新增文件，只在已命中原词的文件里补段落，避免“纯碱”这类泛词爆炸。'","note: '执行 1 次，与第 2 步合并扫描。模型补充的一般关联词；与第 4 步共用“关联词数量上限”和下方“关联词输出”上限。它不会新增文件，只在已命中原词的文件里补段落，避免“纯碱”这类泛词爆炸。'");
cl=cl.replaceAll("扩展检索·最多文件数","关联词输出·最多文件数");
cl=cl.replaceAll("扩展检索·每文件位置数","关联词输出·每文件位置数");
cl=cl.replaceAll("扩展检索·片段长度","关联词输出·片段长度");
fs.writeFileSync(p,cl,"utf8");
console.log("shared caps and flow labels");
