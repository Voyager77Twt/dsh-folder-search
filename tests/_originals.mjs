import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  const keywords = normalizeKeywords(args.keywords);","  let keywords = normalizeKeywords(args.keywords);");
c=c.replace("  const associations = { ...(config.associations || {}), ...(settings.customAssociations || {}) };\n  const { map: expansion, all: terms } = expandTerms(keywords, associations, expand, settings.associationLimit ?? 4);\n  // 强关联词由模型自己判断，可带来新文件；一般关联词只补充已命中文件，避免泛词爆炸。\n  const strongTerms = settings.enableStrong === false ? [] : (Array.isArray(args.strongTerms) ? args.strongTerms : []).map((term) => String(term).trim()).filter(Boolean).slice(0, Number(settings.strongLimit ?? 1));\n  const generalTerms = settings.enableGeneral === false ? [] : (Array.isArray(args.generalTerms) ? args.generalTerms : []).map((term) => String(term).trim()).filter(Boolean).slice(0, Number(settings.associationLimit ?? 4));",
"  const associations = { ...(config.associations || {}), ...(settings.customAssociations || {}) };\n  // keywords 只保留用户原词：模型若把同一个词同时放进 strong/general，先从 keywords 去重。\n  const strongTerms = settings.enableStrong === false ? [] : (Array.isArray(args.strongTerms) ? args.strongTerms : []).map((term) => String(term).trim()).filter(Boolean).slice(0, Number(settings.strongLimit ?? 1));\n  const generalTerms = settings.enableGeneral === false ? [] : (Array.isArray(args.generalTerms) ? args.generalTerms : []).map((term) => String(term).trim()).filter(Boolean).slice(0, Number(settings.associationLimit ?? 4));\n  const excluded = new Set([...strongTerms, ...generalTerms]);\n  const keptKeywords = keywords.filter((term) => !excluded.has(term));\n  if (keptKeywords.length) keywords = keptKeywords;\n  const { map: expansion, all: terms } = expandTerms(keywords, associations, expand, settings.associationLimit ?? 4);");
fs.writeFileSync(p,c,"utf8");
p="lib/index.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("description: '1–6 个关键词。多关键词的 all/any 由调用方按用户意图决定；类型描述可先拆成候选词。'","description: '只能放用户原话中的检索词（1–3 个）；不要放同义词、别名、旧称、缩写或领域词，补充词放 strongTerms/generalTerms，不要复制进 keywords。'");
fs.writeFileSync(p,c,"utf8");
p="cordis.patch.yml"; c=fs.readFileSync(p,"utf8");
c=c.replace("                - 第一次检索前自检：这道题的核心对象有没有“人 / 旧称 / 缩写 / 别名”？有就填 1 个专名到 strongTerms，没有就留空；强关联词不是同义词，不要填父类/领域词。一般关联词放 generalTerms；数量受设置页上限约束。不要为补词再搜第二次。","                - keywords 只放用户原话中的检索词；同义词、别名、旧称、缩写、领域词分别放 strongTerms/generalTerms，不要复制进 keywords。\n                - 第一次检索前自检：这道题的核心对象有没有“人 / 旧称 / 缩写 / 别名”？有就填 1 个专名到 strongTerms，没有就留空；强关联词不是同义词，不要填父类/领域词。一般关联词放 generalTerms；数量受设置页上限约束。不要为补词再搜第二次。");
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.10"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
fs.writeFileSync("README.md",fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.9`","- 版本：`0.5.10`"),"utf8");
console.log("keywords original only");
