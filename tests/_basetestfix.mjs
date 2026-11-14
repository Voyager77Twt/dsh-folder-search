import fs from "node:fs";
let p="tests/_static-audit.mjs"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  const r = await searchLibrary(idx, baseArgs, cfg, { ...settings, dedupe });","  const r = await searchLibrary(idx, baseArgs, cfg, { ...settings, dedupe, searchMode: 'custom' });");
c=c.replace("  ok(r.totals.directFiles + r.totals.expandedFiles + r.totals.relatedFiles === r.totals.files, \"category totals sum dedupe=\" + dedupe);","  ok(r.totals.directFiles + r.totals.expandedFiles + r.totals.relatedFiles + r.totals.generalFiles === r.totals.files, \"category totals sum dedupe=\" + dedupe);");
c=c.replace("const final10 = await searchLibrary(idx, { keywords: [\"沉淀溶解平衡\"], refresh: \"never\" }, cfg, { ...settings, finalMaxFiles: 10, dedupe: false });","const final10 = await searchLibrary(idx, { keywords: [\"沉淀溶解平衡\"], refresh: \"never\" }, cfg, { ...settings, searchMode: 'custom', finalMaxFiles: 10, dedupe: false });");
fs.writeFileSync(p,c,"utf8");
console.log("base tests compact-aware");
