import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
// remove helper functions
c=c.replace(/    function strongTextOf\(map\) \{[\s\S]*?\n    \}\n\n    function parseStrongText\(text\) \{[\s\S]*?\n    \}\n\n/, "");
// remove state
c=c.replace("      const [status, setStatus] = React.useState('');\n      const [strongText, setStrongText] = React.useState('');","      const [status, setStatus] = React.useState('');");
c=c.replace("              setSettings(data.settings);\n              setStrongText(strongTextOf(data.settings.strongAssociations));","              setSettings(data.settings);");
c=c.replace("          setSettings(data.settings);\n          setStrongText(strongTextOf(data.settings.strongAssociations));","          setSettings(data.settings);");
// replace strong card
const oldStart = `        h(
          'div',
          { style: card },
          h('p', { style: title }, '强关联词'),`;
const oldEnd = `        h(
          'div',
          { style: card },
          h('p', { style: title }, '搜索步骤'),`;
const i = c.indexOf(oldStart); const j = c.indexOf(oldEnd);
if(i<0||j<0||j<i) throw new Error('strong card markers not found');
const newCard = `        h(
          'div',
          { style: card },
          h('p', { style: title }, '模型补充关联词'),
          h(
            Field,
            { note: '模型在第一次检索前自己想的、与主题强相关的概念（不是同义词，也不是固定词表）。默认 1，0=不允许补充。' },
            h('span', { style: label }, '强关联词上限'),
            h('input', {
              type: 'number',
              min: 0,
              max: 4,
              style: input,
              value: num(settings.strongLimit, 1),
              onChange: (event) => update({ strongLimit: Math.max(0, num(event.target.value, 1)) }),
            }),
          ),
          h(
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
        ),
        `;
c = c.slice(0,i) + newCard + c.slice(j);
// clarify expansion labels
c=c.replace("h('p', { style: title }, '关联词扩展'),","h('p', { style: title }, '自动关联词扩展（词表）'),");
c=c.replace("h('span', { style: label }, '扩展·文件数')","h('span', { style: label }, '扩展检索·最多文件数')");
c=c.replace("h('span', { style: label }, '每文件位置')","h('span', { style: label }, '扩展检索·每文件位置数')");
c=c.replace("h('span', { style: label }, '片段长度'),\n            h('input', {\n              type: 'number',\n              min: 20,\n              max: 400,\n              style: input,\n              value: num(settings.expandSnippetChars, 45),","h('span', { style: label }, '扩展检索·片段长度'),\n            h('input', {\n              type: 'number',\n              min: 20,\n              max: 400,\n              style: input,\n              value: num(settings.expandSnippetChars, 45),");
fs.writeFileSync(p,c,"utf8");
// tool params
p="lib/index.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("  match: { type: 'string', enum: ['all', 'any'], description: 'all=文件需包含全部关键词；any=任一即可（默认 any）。' },","  match: { type: 'string', enum: ['all', 'any'], description: 'all=文件需包含全部关键词；any=任一即可（默认 any）。' },\n  strongTerms: { type: 'array', items: { type: 'string' }, description: '模型自己想的强关联概念（不是同义词）；数量由设置页“强关联词上限”限制。' },\n  generalTerms: { type: 'array', items: { type: 'string' }, description: '模型补充的一般关联词；数量由设置页“一般关联词上限”限制。' },");
fs.writeFileSync(p,c,"utf8");
// persona
p="cordis.patch.yml"; c=fs.readFileSync(p,"utf8");
c=c.replace("                - 第一次检索会自动带上强关联词（如 侯氏制碱法 → 侯德榜），不要把同一个问题先搜一次再补别名；一次把关键词给全，必要时再补搜。","                - 第一次检索前自己先想：1 个与主题强相关的概念（不是同义词）放进 strongTerms；需要时把最多 N 个一般关联放进 generalTerms；数量受设置页上限约束。不要为补词再搜第二次，也不要把强关联词当成关键词的同义词。");
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.4.1"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
const rd=fs.readFileSync("README.md","utf8").replace("- 版本：`0.4.0`","- 版本：`0.4.1`"); fs.writeFileSync("README.md",rd,"utf8");
console.log("0.4.1 model terms ui");
