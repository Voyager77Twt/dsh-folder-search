import fs from "node:fs";
// index.js: only settingsOnly host row registers route
let p="lib/index.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  const resolved = normalizeConfig(config);\n  registerSettingsRoute(ctx);\n  if (config && config.settingsOnly === true) return;","  const resolved = normalizeConfig(config);\n  if (config && config.settingsOnly === true) {\n    registerSettingsRoute(ctx);\n    return;\n  }");
fs.writeFileSync(p,c,"utf8");
// settings store new toggles
p="lib/settings-store.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("  outlineMaxFiles: 60,","  outlineMaxFiles: 60,\n  syncBeforeSearch: true,\n  includeSnippets: true,\n  includeQuestionNumbers: true,\n  matchScope: 'file',");
c=c.replace("  base.outlineMaxFiles = integer(source.outlineMaxFiles, 1, 200, base.outlineMaxFiles);","  base.outlineMaxFiles = integer(source.outlineMaxFiles, 1, 200, base.outlineMaxFiles);\n  if (typeof source.syncBeforeSearch === 'boolean') base.syncBeforeSearch = source.syncBeforeSearch;\n  if (typeof source.includeSnippets === 'boolean') base.includeSnippets = source.includeSnippets;\n  if (typeof source.includeQuestionNumbers === 'boolean') base.includeQuestionNumbers = source.includeQuestionNumbers;\n  if (source.matchScope === 'file' || source.matchScope === 'block') base.matchScope = source.matchScope;");
fs.writeFileSync(p,c,"utf8");
// search: sync toggle, matchScope, snippets, question labels
p="lib/search.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("  const matchScope = args.matchScope === 'block' ? 'block' : 'file';","  const matchScope = (args.matchScope ?? settings.matchScope) === 'block' ? 'block' : 'file';");
c=c.replace("  const refresh = args.refresh === 'force' ? 'force' : args.refresh === 'never' ? 'never' : 'auto';","  const refresh = args.refresh === 'force' ? 'force' : args.refresh === 'never' || settings.syncBeforeSearch === false ? 'never' : 'auto';");
c=c.replace("        label: question ? `${baseLabel} · 题号 ${question.no}（文中编号）` : baseLabel,","        label: settings.includeQuestionNumbers === false ? baseLabel : question ? `${baseLabel} · 题号 ${question.no}（文中编号）` : baseLabel,");
c=c.replace("        snippet: snippetAround(text, terms.filter((term) => (caseSensitive ? text : text.toLowerCase()).includes(caseSensitive ? term : term.toLowerCase())), snippetChars),","        snippet: settings.includeSnippets === false ? '' : snippetAround(text, terms.filter((term) => (caseSensitive ? text : text.toLowerCase()).includes(caseSensitive ? term : term.toLowerCase())), snippetChars),");
c=c.replace("        lines.push(`   - ${block.label}：${block.snippet}`);","        lines.push(`   - ${block.label}${block.snippet ? `：${block.snippet}` : ''}`);");
fs.writeFileSync(p,c,"utf8");
console.log("settings steps wired");
