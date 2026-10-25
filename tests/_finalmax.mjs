import fs from "node:fs";
// settings
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  outlineMaxFiles: 60,","  outlineMaxFiles: 60,\n  finalMaxFiles: 'all',");
c=c.replace("  base.outlineMaxFiles = integer(source.outlineMaxFiles, 1, 200, base.outlineMaxFiles);","  base.outlineMaxFiles = integer(source.outlineMaxFiles, 1, 200, base.outlineMaxFiles);\n  base.finalMaxFiles = source.finalMaxFiles === 'all' ? 'all' : integer(source.finalMaxFiles, 1, 5000, base.finalMaxFiles);");
fs.writeFileSync(p,c,"utf8");
// search final cap
p="lib/search.js"; let s=fs.readFileSync(p,"utf8");
s=s.replace("  const truncated = shownDirect.length < directResults.length || shownExpanded.length < expandedResults.length || shownRelated.length < relatedResults.length;\n  results = [...shownDirect, ...shownExpanded, ...shownRelated];",
"  let truncated = shownDirect.length < directResults.length || shownExpanded.length < expandedResults.length || shownRelated.length < relatedResults.length;\n  results = [...shownDirect, ...shownExpanded, ...shownRelated];\n  const finalMax = settings.finalMaxFiles ?? 'all';\n  const finalLimit = finalMax === 'all' ? Infinity : Math.max(1, Math.min(Number(finalMax), 5000));\n  if (results.length > finalLimit) {\n    results = results.slice(0, finalLimit);\n    truncated = true;\n  }");
fs.writeFileSync(p,s,"utf8");
console.log("final max setting");
