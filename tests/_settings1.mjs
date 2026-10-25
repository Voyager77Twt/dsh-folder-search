import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("export async function searchLibrary(index, args, config = {}) {","export async function searchLibrary(index, args, config = {}, settings = {}) {");
c=c.replace("  const expand = args.expand !== false;","  const expand = args.expand !== undefined ? args.expand !== false : settings.expand !== false;");
c=c.replace("  const maxFiles = Math.max(1, Math.min(Number(args.maxFiles ?? (expanding ? config.expandMaxFiles ?? 8 : config.maxFiles ?? 25)), 100));\n  const maxBlocksPerFile = Math.max(1, Math.min(Number(args.maxBlocksPerFile ?? (expanding ? config.expandMaxBlocksPerFile ?? 2 : config.maxBlocksPerFile ?? 4)), 20));\n  const snippetChars = Math.max(20, Number(args.snippetChars ?? (expanding ? config.expandSnippetChars ?? 60 : config.snippetChars ?? 120)));",
`  const rawMaxFiles = args.maxFiles ?? (expanding ? settings.expandMaxFiles ?? config.expandMaxFiles ?? 8 : settings.normalMaxFiles ?? config.maxFiles ?? 'all');
  const maxFiles = rawMaxFiles === 'all' ? Infinity : Math.max(1, Math.min(Number(rawMaxFiles), 5000));
  const maxBlocksPerFile = Math.max(1, Math.min(Number(args.maxBlocksPerFile ?? (expanding ? settings.expandMaxBlocksPerFile ?? config.expandMaxBlocksPerFile ?? 2 : settings.normalMaxBlocksPerFile ?? config.maxBlocksPerFile ?? 4)), 50));
  const snippetChars = Math.max(20, Number(args.snippetChars ?? (expanding ? settings.expandSnippetChars ?? config.expandSnippetChars ?? 45 : settings.normalSnippetChars ?? config.snippetChars ?? 90)));
  const dedupe = args.dedupe ?? settings.dedupe ?? config.dedupe === true;`);
c=c.replace("  if (config.dedupe === true && args.dedupe !== false) {","  if (dedupe) {");
fs.writeFileSync(p,c,"utf8");
console.log("search settings patched");
