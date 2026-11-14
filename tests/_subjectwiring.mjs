import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("import { collapse, humanBytes, resolveRg, toPosix, sha1 } from './util.js';","import { collapse, humanBytes, resolveRg, toPosix, sha1 } from './util.js';\nimport { GENERAL_ASSOCIATIONS, SUBJECT_ASSOCIATIONS } from './subject-dictionaries.js';");
const old=`export function expandTerms(keywords, associations = {}, enabled = true, limit = 8, customAssociations = {}, includeCustom = enabled) {
  const map = new Map();
  const keys = Object.entries(associations || {});
  for (const keyword of keywords) {
    if (!enabled && !includeCustom) {
      map.set(keyword, [keyword]);
      continue;
    }
    const terms = new Set([keyword]);
    const customValues = includeCustom && Array.isArray(customAssociations[keyword]) ? customAssociations[keyword] : [];
    if (!enabled) {
      for (const value of customValues.slice(0, Math.max(0, limit))) terms.add(value);
      map.set(keyword, [...terms].slice(0, Math.max(1, Math.min(8, limit + 1))));
      continue;
    }
    const builtinValues = Array.isArray(associations[keyword]) ? associations[keyword] : [];
    const merged = [...new Set([...customValues, ...builtinValues])];
    for (const value of merged.slice(0, limit + 1)) terms.add(value);
    for (const [key, values] of keys) {
      if (keyword.includes(key) || key.includes(keyword)) {
        for (const value of values) if (typeof value === 'string' && value.trim()) terms.add(value.trim());
      }
    }
    map.set(keyword, [...terms].slice(0, Math.max(1, Math.min(8, limit + 1))));
  }
  const all = [...new Set([...map.values()].flat())].slice(0, 48);
  return { map, all };
}`;
const neu=`export function expandTerms(keywords, associations = {}, enabled = true, limit = 8, customAssociations = {}, includeCustom = enabled, alwaysAssociations = {}) {
  const map = new Map();
  const mergedAssociations = { ...(alwaysAssociations || {}), ...(associations || {}) };
  const keys = Object.entries(mergedAssociations);
  for (const keyword of keywords) {
    if (!enabled && !includeCustom) {
      map.set(keyword, [keyword]);
      continue;
    }
    const terms = new Set([keyword]);
    const customValues = includeCustom && Array.isArray(customAssociations[keyword]) ? customAssociations[keyword] : [];
    const alwaysValues = includeCustom && Array.isArray(alwaysAssociations[keyword]) ? alwaysAssociations[keyword] : [];
    if (!enabled) {
      for (const value of [...customValues, ...alwaysValues].slice(0, Math.max(0, limit))) terms.add(value);
      map.set(keyword, [...terms].slice(0, Math.max(1, Math.min(8, limit + 1))));
      continue;
    }
    const builtinValues = Array.isArray(associations[keyword]) ? associations[keyword] : [];
    const merged = [...new Set([...customValues, ...alwaysValues, ...builtinValues])];
    for (const value of merged.slice(0, limit + 1)) terms.add(value);
    for (const [key, values] of keys) {
      if (keyword.includes(key) || key.includes(keyword)) {
        for (const value of values) if (typeof value === 'string' && value.trim()) terms.add(value.trim());
      }
    }
    map.set(keyword, [...terms].slice(0, Math.max(1, Math.min(8, limit + 1))));
  }
  const all = [...new Set([...map.values()].flat())].slice(0, 48);
  return { map, all };
}`;
if(!c.includes(old)) throw new Error('expandTerms marker missing');
c=c.replace(old,neu);
const oldCall="  const { map: expansion, all: terms } = expandTerms(keywords, config.associations, expand, settings.associationLimit ?? 4, settings.customAssociations || {}, settings.searchMode !== 'original');";
const newCall=`  const subject = typeof args?.subject === 'string' && SUBJECT_ASSOCIATIONS[args.subject] ? args.subject : null;
  const subjectAssociations = subject ? SUBJECT_ASSOCIATIONS[subject] : {};
  const includeCustom = settings.searchMode !== 'original';
  const { map: expansion, all: terms } = expandTerms(
    keywords,
    { ...(config.associations || {}), ...subjectAssociations },
    expand,
    settings.associationLimit ?? 4,
    settings.customAssociations || {},
    includeCustom,
    GENERAL_ASSOCIATIONS,
  );`;
if(!c.includes(oldCall)) throw new Error('expandTerms call missing');
c=c.replace(oldCall,newCall);
c=c.replace("      expand,\n      expanded: Object.fromEntries(expansion),","      expand,\n      subject,\n      expanded: Object.fromEntries(expansion),");
fs.writeFileSync(p,c,"utf8");
console.log("subject expansion wiring");
