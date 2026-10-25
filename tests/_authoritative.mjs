import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  const matchScope = (args.matchScope ?? settings.matchScope) === 'block' ? 'block' : 'file';","  const matchScope = settings.matchScope === 'block' ? 'block' : 'file';");
c=c.replace("  const expand = args.expand !== undefined ? args.expand !== false : settings.expand !== false;","  const expand = settings.expand !== false;");
c=c.replace("  const rawMaxFiles = args.maxFiles ?? (expanding ? settings.expandMaxFiles ?? config.expandMaxFiles ?? 8 : settings.normalMaxFiles ?? config.maxFiles ?? 'all');","  const rawMaxFiles = expanding ? settings.expandMaxFiles ?? config.expandMaxFiles ?? 8 : settings.normalMaxFiles ?? config.maxFiles ?? 'all';");
c=c.replace("  const maxBlocksPerFile = Math.max(1, Math.min(Number(args.maxBlocksPerFile ?? (expanding ? settings.expandMaxBlocksPerFile ?? config.expandMaxBlocksPerFile ?? 2 : settings.normalMaxBlocksPerFile ?? config.maxBlocksPerFile ?? 4)), 50));","  const maxBlocksPerFile = Math.max(1, Math.min(Number(expanding ? settings.expandMaxBlocksPerFile ?? config.expandMaxBlocksPerFile ?? 2 : settings.normalMaxBlocksPerFile ?? config.maxBlocksPerFile ?? 4), 50));");
c=c.replace("  const snippetChars = Math.max(20, Number(args.snippetChars ?? (expanding ? settings.expandSnippetChars ?? config.expandSnippetChars ?? 45 : settings.normalSnippetChars ?? config.snippetChars ?? 90)));","  const snippetChars = Math.max(20, Number(expanding ? settings.expandSnippetChars ?? config.expandSnippetChars ?? 45 : settings.normalSnippetChars ?? config.snippetChars ?? 90));");
c=c.replace("  const dedupe = args.dedupe ?? settings.dedupe ?? config.dedupe === true;","  const dedupe = settings.dedupe === true || config.dedupe === true;");
fs.writeFileSync(p,c,"utf8");
p="lib/index.js"; c=fs.readFileSync(p,"utf8");
const lines=[
"  matchScope: { type: 'string', enum: ['file', 'block'], description: 'file=同一文件内覆盖即可（默认）；block=同一段/页/单元格内。' },",
"  expand: { type: 'boolean', description: '是否用配置里的常见关联词扩展（默认 true，例如 有机 → 烃/醇/醛）。' },",
"  maxFiles: { type: 'integer', description: '最多返回多少个文件（默认 25；关联词扩展时默认 8）。' },",
"  maxBlocksPerFile: { type: 'integer', description: '每个文件最多显示多少处位置（默认 4；关联词扩展时默认 2）。' },",
"  snippetChars: { type: 'integer', description: '每个片段最多多少字符（默认 120；关联词扩展时默认 60）。' },",
"  dedupe: { type: 'boolean', description: '合并命中内容完全相同的重复文件（默认 false）。' },"
];
for(const line of lines){ c=c.replace(line+"\n",""); }
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.3.5"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
const rd=fs.readFileSync("README.md","utf8").replace("- 版本：`0.3.4`","- 版本：`0.3.5`"); fs.writeFileSync("README.md",rd,"utf8");
console.log("0.3.5 settings authoritative");
