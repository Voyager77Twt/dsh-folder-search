import fs from "node:fs";
// settings store: remove generalLimit
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  strongLimit: 1,\n  generalLimit: 2,","  strongLimit: 1,");
c=c.replace("  base.generalLimit = integer(source.generalLimit, 0, 8, base.generalLimit);\n","");
fs.writeFileSync(p,c,"utf8");
// search: general terms use associationLimit
p="lib/search.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("const generalTerms = (Array.isArray(args.generalTerms) ? args.generalTerms : []).map((term) => String(term).trim()).filter(Boolean).slice(0, Number(settings.generalLimit ?? 2));","const generalTerms = (Array.isArray(args.generalTerms) ? args.generalTerms : []).map((term) => String(term).trim()).filter(Boolean).slice(0, Number(settings.associationLimit ?? 4));");
fs.writeFileSync(p,c,"utf8");
// client: remove generalLimit field, clarify associationLimit
p="lib/client.js"; let cl=fs.readFileSync(p,"utf8");
cl=cl.replace("note: '每个关键词最多扩展出多少个关联词（不含原词）；数字越大命中越宽、费用越高。'","note: '自动词表和模型补充的一般关联词共用这个上限：每个关键词最多几个关联词（不含原词）。数字越大命中越宽、费用越高。'");
cl=cl.replace("h('span', { style: label }, '关联词数量上限')","h('span', { style: label }, '关联词数量上限（自动词表 + 一般关联）')");
const generalField = `          h(
            Field,
            { note: '模型可补充的一般相关词数量；越多命中越宽、费用越高。默认 2，0=不允许补充。' },
            h('span', { style: label }, '一般关联词上限'),
            h('input', {
              type: 'number',
              min: 0,
              max: 8,
              style: input,
              value: num(settings.generalLimit, 2),
              onChange: (event) => update({ generalLimit: Math.max(0, num(event.target.value, 2)) }),
            }),
          ),
`;
if(!cl.includes(generalField)) throw new Error('general field marker missing');
cl=cl.replace(generalField,"");
fs.writeFileSync(p,cl,"utf8");
// tool description
p="lib/index.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("description: '模型补充的一般关联词；数量由设置页“一般关联词上限”限制。'","description: '模型补充的一般关联词；数量由设置页“关联词数量上限”限制（和自动词表共用）。'");
fs.writeFileSync(p,c,"utf8");
// README table
p="README.md"; c=fs.readFileSync(p,"utf8");
c=c.replace("| 关联词数量上限 | 4 | 每个关键词最多扩出几个词表关联词 |","| 关联词数量上限 | 4 | 自动词表和模型补充的一般关联词共用；每个关键词最多几个关联词 |");
c=c.replace("| 一般关联词上限 | 2 | 模型补充的一般关联词数；不新增文件，只补已命中文件里的段落 |\n","");
c=c.replace("| 强关联词上限 | 1 | 模型自己想、第一次检索就带的强关联概念数；0=禁止 |","| 强关联词上限 | 1 | 独立于一般关联词；模型自己想、第一次检索就带的强关联概念数；0=禁止 |");
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.2"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
const rd=fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.1`","- 版本：`0.5.2`"); fs.writeFileSync("README.md",rd,"utf8");
console.log("0.5.2 merged association limit");
