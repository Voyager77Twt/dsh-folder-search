import fs from "node:fs";
// settings store: association limit
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  expandSnippetChars: 45,","  expandSnippetChars: 45,\n  associationLimit: 4,");
c=c.replace("  base.expandSnippetChars = integer(source.expandSnippetChars, 20, 400, base.expandSnippetChars);","  base.expandSnippetChars = integer(source.expandSnippetChars, 20, 400, base.expandSnippetChars);\n  base.associationLimit = integer(source.associationLimit, 1, 8, base.associationLimit);");
fs.writeFileSync(p,c,"utf8");
// expandTerms limit
p="lib/search.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("export function expandTerms(keywords, associations = {}, enabled = true) {","export function expandTerms(keywords, associations = {}, enabled = true, limit = 8) {");
c=c.replace("    map.set(keyword, [...terms].slice(0, 8));","    map.set(keyword, [...terms].slice(0, Math.max(1, Math.min(8, limit + 1))));");
c=c.replace("  const { map: expansion, all: terms } = expandTerms(keywords, config.associations, expand);","  const { map: expansion, all: terms } = expandTerms(keywords, config.associations, expand, settings.associationLimit ?? 4);");
fs.writeFileSync(p,c,"utf8");
// client order + error text + association field
p="lib/client.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("order: 6,","order: 50,");
c=c.replace("setStatus('读取失败：请先在任意会话里使用一次「文件库检索模式」，再打开本页。')","setStatus('读取设置失败：' + (error && error.message ? error.message : String(error)))");
c=c.replace("h(\n            Field,\n            { note: '只有扩展真正生效时才用这三项；普通关键词仍用上面的普通检索设置。' },","h(\n            Field,\n            { note: '每个关键词最多扩展出多少个关联词（不含原词）；数字越大命中越宽、费用越高。' },\n            h('span', { style: label }, '关联词数量上限'),\n            h('input', {\n              type: 'number',\n              min: 1,\n              max: 8,\n              style: input,\n              value: num(settings.associationLimit, 4),\n              onChange: (event) => update({ associationLimit: num(event.target.value, 1) }),\n            }),\n          ),\n          h(\n            Field,\n            { note: '只有扩展真正生效时才用这三项；普通关键词仍用上面的普通检索设置。' },");
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.3.3"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
const rd=fs.readFileSync("README.md","utf8").replace("- 版本：`0.3.2`","- 版本：`0.3.3`"); fs.writeFileSync("README.md",rd,"utf8");
console.log("0.3.3 settings order/limit");
