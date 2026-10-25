import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
const marker="export function renderSearchResult(result) {";
const wrapper=`export async function searchLibrary(index, args, config = {}, settings = {}) {
  let current = args;
  let result = await searchOnce(index, current, config, settings);
  const maxRetries = Math.max(0, Number(settings.strongRetryMax ?? 1));
  let remaining = settings.strongRetry === true ? maxRetries : 0;
  const removed = new Set();
  while (result.strongGate?.demoted?.length && remaining > 0) {
    const fresh = result.strongGate.demoted.filter((term) => !removed.has(term));
    if (!fresh.length) break;
    for (const term of fresh) removed.add(term);
    const strongTerms = (Array.isArray(current.strongTerms) ? current.strongTerms : []).filter((term) => !removed.has(term));
    if (!strongTerms.length) break;
    current = { ...current, strongTerms };
    result = await searchOnce(index, current, config, settings);
    remaining -= 1;
  }
  return result;
}

${marker}`;
if(!c.includes(marker)) throw new Error('render marker missing');
c=c.replace(marker, wrapper);
fs.writeFileSync(p,c,"utf8");
console.log("retry wrapper");
