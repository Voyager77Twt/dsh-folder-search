import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("import { collapse, humanBytes, resolveRg, toPosix } from './util.js';","import { collapse, humanBytes, resolveRg, toPosix, sha1 } from './util.js';");
c=c.replace("function snippetAround(text, terms, chars = 120) {","function snippetAround(text, terms, chars = 60) {");
c=c.replace("        snippet: snippetAround(text, terms.filter((term) => (caseSensitive ? text : text.toLowerCase()).includes(caseSensitive ? term : term.toLowerCase()))),","        snippet: snippetAround(text, terms.filter((term) => (caseSensitive ? text : text.toLowerCase()).includes(caseSensitive ? term : term.toLowerCase())), Number(config.snippetChars ?? 60)),\n        hash: sha1(text),");
c=c.replace("  fileResults.sort((a, b) => b.keywords.length - a.keywords.length || b.blocksHit - a.blocksHit || a.rel.localeCompare(b.rel));","  let results = fileResults;\n  if (config.dedupe !== false && args.dedupe !== false) {\n    const groups = new Map();\n    for (const file of fileResults) {\n      const signature = sha1(file.blocks.map((block) => block.hash ?? block.label).join('|'));\n      const group = groups.get(signature);\n      if (group) {\n        group.aliases.push({ path: file.path, name: file.name });\n        group.blocksHit += file.blocksHit;\n      } else {\n        file.signature = signature;\n        file.aliases = [];\n        groups.set(signature, file);\n      }\n    }\n    results = [...groups.values()];\n  }\n  results.sort((a, b) => b.keywords.length - a.keywords.length || b.blocksHit - a.blocksHit || a.rel.localeCompare(b.rel));");
c=c.replace("  if (fileResults.length > maxFiles) {\n    fileResults.length = maxFiles;\n    truncated = true;\n  }","  if (results.length > maxFiles) {\n    results = results.slice(0, maxFiles);\n    truncated = true;\n  }");
c=c.replace("    files: fileResults,","    files: results,");
c=c.replace("    shownFiles: fileResults.length,\n    shownBlocks: fileResults.reduce((sum, file) => sum + file.blocks.length, 0),","    shownFiles: results.length,\n    shownBlocks: results.reduce((sum, file) => sum + file.blocks.length, 0),");
c=c.replace("      lines.push(`${index + 1}. ${markdownLink(file.name, file.path)}（${kindLabel(file.kind)}，${file.blocksHit} 处）`);","      lines.push(`${index + 1}. ${markdownLink(file.name, file.path)}（${kindLabel(file.kind)}，${file.blocksHit} 处${file.aliases?.length ? `；相同内容另有 ${file.aliases.length} 个` : ''}）`);");
c=c.replace("        lines.push(`   - ${markdownLink(block.label, block.open)}：${block.snippet}`);","        lines.push(`   - ${block.label}：${block.snippet}`);");
fs.writeFileSync(p,c,"utf8");
// config defaults in index.js
p="lib/index.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("    maxFiles: Math.max(1, numberOr(input.maxFiles, 25)),\n    maxBlocksPerFile: Math.max(1, numberOr(input.maxBlocksPerFile, 4)),","    maxFiles: Math.max(1, numberOr(input.maxFiles, 6)),\n    maxBlocksPerFile: Math.max(1, numberOr(input.maxBlocksPerFile, 2)),");
c=c.replace("    cacheCapMB: Math.max(10, numberOr(input.cacheCapMB, 250)),","    cacheCapMB: Math.max(10, numberOr(input.cacheCapMB, 250)),\n    snippetChars: Math.max(20, numberOr(input.snippetChars, 60)),\n    dedupe: input.dedupe !== false,");
c=c.replace("  maxFiles: { type: 'integer', description: '最多返回多少个文件（默认 25）。' },\n  maxBlocksPerFile: { type: 'integer', description: '每个文件最多显示多少处位置（默认 4）。' },","  maxFiles: { type: 'integer', description: '最多返回多少个文件（默认 6）。' },\n  maxBlocksPerFile: { type: 'integer', description: '每个文件最多显示多少处位置（默认 2）。' },\n  snippetChars: { type: 'integer', description: '每个片段最多多少字符（默认 60）。' },\n  dedupe: { type: 'boolean', description: '合并命中内容完全相同的重复文件（默认 true）。' },");
fs.writeFileSync(p,c,"utf8");
// outline default files 20
p="lib/outline.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("const maxFiles = Math.max(1, Math.min(Number(args.maxFiles ?? 60), 200));","const maxFiles = Math.max(1, Math.min(Number(args.maxFiles ?? 20), 200));");
c=c.replace("const sections = Array.isArray(entry.sections) ? entry.sections.slice(0, 4) : [];","const sections = Array.isArray(entry.sections) ? entry.sections.slice(0, 3) : [];");
c=c.replace("const questions = Array.isArray(entry.questions) ? entry.questions.slice(0, 10) : [];","const questions = Array.isArray(entry.questions) ? entry.questions.slice(0, 8) : [];");
fs.writeFileSync(p,c,"utf8");
console.log("compact+dedupe patched");
