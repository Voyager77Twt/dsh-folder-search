import fs from "node:fs";
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  finalMaxFiles: 'all',","  finalMaxFiles: 'all',\n  searchMode: 'default',");
c=c.replace("  base.finalMaxFiles = source.finalMaxFiles === 'all' ? 'all' : integer(source.finalMaxFiles, 1, 5000, base.finalMaxFiles);","  base.finalMaxFiles = source.finalMaxFiles === 'all' ? 'all' : integer(source.finalMaxFiles, 1, 5000, base.finalMaxFiles);\n  if (['original', 'default', 'full', 'custom'].includes(source.searchMode)) base.searchMode = source.searchMode;");
fs.writeFileSync(p,c,"utf8");
p="lib/search.js"; c=fs.readFileSync(p,"utf8");
const helper=`const SEARCH_MODES = ['original', 'default', 'full', 'custom'];

function applySearchMode(settings = {}) {
  const mode = SEARCH_MODES.includes(settings.searchMode) ? settings.searchMode : 'default';
  const next = { ...settings, searchMode: mode };
  if (mode === 'original') {
    next.expand = false;
    next.enableStrong = false;
    next.enableGeneral = false;
    next.allowGeneralFiles = false;
    next.strongRetry = false;
  } else if (mode === 'full') {
    next.expand = true;
    next.enableStrong = true;
    next.enableGeneral = true;
    next.allowGeneralFiles = true;
    next.strongRetry = true;
    next.strongLimit = Math.max(Number(next.strongLimit ?? 2), 4);
    next.associationLimit = Math.max(Number(next.associationLimit ?? 4), 8);
    next.normalMaxFiles = 'all';
    next.expandMaxFiles = 'all';
    next.strongMaxFiles = 'all';
    next.finalMaxFiles = 'all';
  }
  return next;
}

`;
if(!c.includes("function applySearchMode")) c=c.replace("async function searchOnce(", helper+"async function searchOnce(");
c=c.replace("export async function searchLibrary(index, args, config = {}, settings = {}) {\n  let current = args;\n  let result = await searchOnce(index, current, config, settings);","export async function searchLibrary(index, args, config = {}, settings = {}) {\n  const effective = applySearchMode(settings);\n  let current = args;\n  let result = await searchOnce(index, current, config, effective);");
c=c.replace("  const maxRetries = Math.max(0, Number(settings.strongRetryMax ?? 1));\n  let remaining = settings.strongRetry === true ? maxRetries : 0;","  const maxRetries = Math.max(0, Number(effective.strongRetryMax ?? 1));\n  let remaining = effective.strongRetry === true ? maxRetries : 0;");
c=c.replace("    result = await searchOnce(index, current, config, settings);","    result = await searchOnce(index, current, config, effective);");
fs.writeFileSync(p,c,"utf8");
console.log("search modes");
