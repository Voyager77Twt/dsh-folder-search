import fs from "node:fs";
let p="lib/index.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  match: { type: 'string', enum: ['all', 'any'], description: 'all=文件需包含全部关键词；any=任一即可（默认 any）。' },","  match: { type: 'string', enum: ['all', 'any'], description: 'all=文件需包含全部关键词；any=任一即可（默认 any）。' },\n  all: { type: 'boolean', description: '仅在用户明确说“全部列出/列出所有文件”时设为 true；默认 false，只列前 N 个文件，且每文件仍只列前 2 条命中。' },");
fs.writeFileSync(p,c,"utf8");
let y=fs.readFileSync("cordis.patch.yml","utf8");
y=y.replace("                - 多关键词的匹配方式按用户说法决定：说「都包含 / 同时」用 match=all；说「或 / 任一」用 match=any；拿不准就先用 any 并说明。","                - 多关键词的匹配方式按用户说法决定：说「都包含 / 同时」用 match=all；说「或 / 任一」用 match=any；拿不准就先用 any 并说明。\n                - 默认只列前 N 个文件和每文件前 2 条命中；只有用户明确说「全部列出 / 列出所有文件」时才传 all=true。不要自行展开完整列表。");
fs.writeFileSync("cordis.patch.yml",y,"utf8");
console.log("all schema/prompt");
