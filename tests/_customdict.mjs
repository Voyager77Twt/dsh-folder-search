import fs from "node:fs";
// settings: custom association dictionary
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  enableGeneral: true,","  enableGeneral: true,\n  customAssociations: {},");
c=c.replace("  if (typeof source.enableGeneral === 'boolean') base.enableGeneral = source.enableGeneral;",`  if (typeof source.enableGeneral === 'boolean') base.enableGeneral = source.enableGeneral;
  const custom = {};
  if (source.customAssociations && typeof source.customAssociations === 'object') {
    for (const [key, value] of Object.entries(source.customAssociations)) {
      if (!key || !Array.isArray(value)) continue;
      const terms = value.map((term) => String(term).trim()).filter(Boolean).slice(0, 8);
      if (terms.length) custom[key.trim()] = terms;
      if (Object.keys(custom).length >= 200) break;
    }
  }
  base.customAssociations = custom;`);
fs.writeFileSync(p,c,"utf8");
// search: merge custom associations
p="lib/search.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("  const { map: expansion, all: terms } = expandTerms(keywords, config.associations, expand, settings.associationLimit ?? 4);","  const associations = { ...(config.associations || {}), ...(settings.customAssociations || {}) };\n  const { map: expansion, all: terms } = expandTerms(keywords, associations, expand, settings.associationLimit ?? 4);");
c=c.replace("const assocActive = (expand && keywords.some((keyword) => (config.associations?.[keyword]?.length ?? 0) > 0)) || generalTerms.length > 0;","const assocActive = (expand && keywords.some((keyword) => (associations?.[keyword]?.length ?? 0) > 0)) || generalTerms.length > 0;");
fs.writeFileSync(p,c,"utf8");
console.log("custom dictionary wired");
