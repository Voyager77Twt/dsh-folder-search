import fs from "node:fs";
// settings: remove hardcoded strong map; add generalLimit
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace(/export const DEFAULT_STRONG_ASSOCIATIONS = \{[\s\S]*?\};\n\n/, "");
c=c.replace("  strongLimit: 1,\n  strongAssociations: DEFAULT_STRONG_ASSOCIATIONS,","  strongLimit: 1,\n  generalLimit: 2,");
c=c.replace(/  base\.strongLimit = integer\(source\.strongLimit, 1, 4, base\.strongLimit\);\n  const strong = \{\};\n  if \(source\.strongAssociations[\s\S]*?base\.strongAssociations = Object\.keys\(strong\)\.length \? strong : \{ \.\.\.DEFAULT_STRONG_ASSOCIATIONS \};/, "  base.strongLimit = integer(source.strongLimit, 0, 4, base.strongLimit);\n  base.generalLimit = integer(source.generalLimit, 0, 8, base.generalLimit);");
fs.writeFileSync(p,c,"utf8");
// search: remove strong map, accept extras
p="lib/search.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("export function expandTerms(keywords, associations = {}, enabled = true, limit = 8, strongAssociations = {}, strongLimit = 1) {","export function expandTerms(keywords, associations = {}, enabled = true, limit = 8) {");
c=c.replace("    const strong = Array.isArray(strongAssociations[keyword]) ? strongAssociations[keyword] : [];\n    for (const value of strong.slice(0, Math.max(1, Math.min(4, strongLimit)))) terms.add(value);\n","");
c=c.replace("  const { map: expansion, all: terms } = expandTerms(keywords, config.associations, expand, settings.associationLimit ?? 4, settings.strongAssociations ?? {}, settings.strongLimit ?? 1);","  const { map: expansion, all: terms } = expandTerms(keywords, config.associations, expand, settings.associationLimit ?? 4);\n  const strongTerms = (Array.isArray(args.strongTerms) ? args.strongTerms : []).map((term) => String(term).trim()).filter(Boolean).slice(0, Number(settings.strongLimit ?? 1));\n  const generalTerms = (Array.isArray(args.generalTerms) ? args.generalTerms : []).map((term) => String(term).trim()).filter(Boolean).slice(0, Number(settings.generalLimit ?? 2));\n  const extraTerms = [...strongTerms, ...generalTerms];\n  for (const term of extraTerms) if (!terms.includes(term)) terms.push(term);");
// block matching with extras
c=c.replace("      if (!matched.length) continue;","      const extraMatched = extraTerms.filter((term) => (caseSensitive ? text : text.toLowerCase()).includes(caseSensitive ? term : term.toLowerCase()));\n      if (!matched.length && !extraMatched.length) continue;");
c=c.replace("      for (const keyword of matched) fileKeywords.add(keyword);","      for (const keyword of matched) fileKeywords.add(keyword);\n      for (const term of extraMatched) fileRelated.add(term);");
c=c.replace("        keywords: matched,","        keywords: matched,\n        related: extraMatched,");
// render related block suffix
c=c.replace("        label: settings.includeQuestionNumbers === false ? baseLabel : question ? `${baseLabel} · 题号 ${question.no}（文中编号）` : baseLabel,","        label: (settings.includeQuestionNumbers === false ? baseLabel : question ? `${baseLabel} · 题号 ${question.no}（文中编号）` : baseLabel) + (extraMatched.length ? ' · 关联词 ' + extraMatched.join('、') : ''),");
// fileRelated init and coverage
c=c.replace("    const blocks = [];\n    const fileKeywords = new Set();","    const blocks = [];\n    const fileKeywords = new Set();\n    const fileRelated = new Set();");
c=c.replace("    const covered = match === 'all' ? fileKeywords.size === keywords.length : fileKeywords.size > 0;","    const covered = match === 'all' ? fileKeywords.size === keywords.length : fileKeywords.size > 0 || fileRelated.size > 0;");
c=c.replace("    const sortedBlocks = blocks.slice(0, maxBlocksPerFile);\n    fileResults.push({\n      path: path.join(index.root, doc.rel),\n      rel: doc.rel,\n      name: path.basename(doc.rel),\n      kind: doc.entry.kind,\n      keywords: [...fileKeywords],","    const sortedBlocks = blocks.slice(0, maxBlocksPerFile);\n    fileResults.push({\n      path: path.join(index.root, doc.rel),\n      rel: doc.rel,\n      name: path.basename(doc.rel),\n      kind: doc.entry.kind,\n      keywords: [...fileKeywords],\n      related: [...fileRelated],\n      relatedOnly: fileKeywords.size === 0 && fileRelated.size > 0,");
// render file line related marker
c=c.replace("（${kindLabel(file.kind)}，${file.blocksHit} 处${file.aliases?.length ? `；相同内容另有 ${file.aliases.length} 个` : ''}）","（${kindLabel(file.kind)}，${file.blocksHit} 处${file.relatedOnly ? '；仅关联词命中' : ''}${file.aliases?.length ? `；相同内容另有 ${file.aliases.length} 个` : ''}）");
fs.writeFileSync(p,c,"utf8");
console.log("model strong/general terms wired");
