import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  const expand = args.expand === true;","  const expand = args.expand !== false;");
c=c.replace("  const { map: expansion, all: terms } = expandTerms(keywords, config.associations, expand);\n  if (!terms.length) throw new Error('扩展后没有可搜索的词');",
"  const { map: expansion, all: terms } = expandTerms(keywords, config.associations, expand);\n  if (!terms.length) throw new Error('扩展后没有可搜索的词');\n  const expanding = expand && [...expansion.values()].some((values) => values.length > 1);");
c=c.replace("  const maxFiles = Math.max(1, Math.min(Number(args.maxFiles ?? config.maxFiles ?? 25), 100));\n  const maxBlocksPerFile = Math.max(1, Math.min(Number(args.maxBlocksPerFile ?? config.maxBlocksPerFile ?? 4), 20));",
"  const maxFiles = Math.max(1, Math.min(Number(args.maxFiles ?? (expanding ? config.expandMaxFiles ?? 8 : config.maxFiles ?? 25)), 100));\n  const maxBlocksPerFile = Math.max(1, Math.min(Number(args.maxBlocksPerFile ?? (expanding ? config.expandMaxBlocksPerFile ?? 2 : config.maxBlocksPerFile ?? 4)), 20));\n  const snippetChars = Math.max(20, Number(args.snippetChars ?? (expanding ? config.expandSnippetChars ?? 60 : config.snippetChars ?? 120)));");
c=c.replace("Number(config.snippetChars ?? 60)),","snippetChars),");
c=c.replace("  if (config.dedupe !== false && args.dedupe !== false) {","  if (config.dedupe === true && args.dedupe !== false) {");
fs.writeFileSync(p,c,"utf8");
p="lib/index.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("    maxFiles: Math.max(1, numberOr(input.maxFiles, 6)),\n    maxBlocksPerFile: Math.max(1, numberOr(input.maxBlocksPerFile, 2)),","    maxFiles: Math.max(1, numberOr(input.maxFiles, 25)),\n    maxBlocksPerFile: Math.max(1, numberOr(input.maxBlocksPerFile, 4)),");
c=c.replace("    snippetChars: Math.max(20, numberOr(input.snippetChars, 60)),\n    dedupe: input.dedupe !== false,","    snippetChars: Math.max(20, numberOr(input.snippetChars, 120)),\n    dedupe: input.dedupe === true,\n    expandMaxFiles: Math.max(1, numberOr(input.expandMaxFiles, 8)),\n    expandMaxBlocksPerFile: Math.max(1, numberOr(input.expandMaxBlocksPerFile, 2)),\n    expandSnippetChars: Math.max(20, numberOr(input.expandSnippetChars, 60)),");
c=c.replace("  expand: { type: 'boolean', description: '是否用配置里的常见关联词扩展（默认 false；按类型找题时才开，例如 有机 → 烃/醇/醛）。' },","  expand: { type: 'boolean', description: '是否用配置里的常见关联词扩展（默认 true，例如 有机 → 烃/醇/醛）。' },");
c=c.replace("  maxFiles: { type: 'integer', description: '最多返回多少个文件（默认 6）。' },\n  maxBlocksPerFile: { type: 'integer', description: '每个文件最多显示多少处位置（默认 2）。' },\n  snippetChars: { type: 'integer', description: '每个片段最多多少字符（默认 60）。' },\n  dedupe: { type: 'boolean', description: '合并命中内容完全相同的重复文件（默认 true）。' },","  maxFiles: { type: 'integer', description: '最多返回多少个文件（默认 25；关联词扩展时默认 8）。' },\n  maxBlocksPerFile: { type: 'integer', description: '每个文件最多显示多少处位置（默认 4；关联词扩展时默认 2）。' },\n  snippetChars: { type: 'integer', description: '每个片段最多多少字符（默认 120；关联词扩展时默认 60）。' },\n  dedupe: { type: 'boolean', description: '合并命中内容完全相同的重复文件（默认 false）。' },");
fs.writeFileSync(p,c,"utf8");
p="lib/outline.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("const maxFiles = Math.max(1, Math.min(Number(args.maxFiles ?? 20), 200));","const maxFiles = Math.max(1, Math.min(Number(args.maxFiles ?? 60), 200));");
fs.writeFileSync(p,c,"utf8");
p="cordis.patch.yml"; c=fs.readFileSync(p,"utf8");
c=c.replace(`              indexBudgetPerCall: 25
              maxFiles: 6
              maxBlocksPerFile: 2
              snippetChars: 60
              cacheCapMB: 250`,"              indexBudgetPerCall: 25\n              expandMaxFiles: 8\n              expandMaxBlocksPerFile: 2\n              expandSnippetChars: 60\n              cacheCapMB: 250");
fs.writeFileSync(p,c,"utf8");
console.log("restored defaults + expansion caps");
