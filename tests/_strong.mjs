import fs from "node:fs";
// settings store: strong associations
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("export const DEFAULT_SETTINGS = {", `export const DEFAULT_STRONG_ASSOCIATIONS = {
  侯氏制碱法: ['侯德榜'],
  侯德榜: ['侯氏制碱法'],
  索尔维制碱法: ['侯氏制碱法', '侯德榜'],
  联合制碱法: ['侯氏制碱法', '侯德榜'],
  小苏打: ['碳酸氢钠'],
  苏打: ['碳酸钠'],
  阿司匹林: ['乙酰水杨酸'],
  摩尔盐: ['硫酸亚铁铵'],
  明矾: ['十二水合硫酸铝钾'],
};

export const DEFAULT_SETTINGS = {`);
c=c.replace("  associationLimit: 4,","  associationLimit: 4,\n  strongLimit: 1,\n  strongAssociations: DEFAULT_STRONG_ASSOCIATIONS,");
c=c.replace("  base.associationLimit = integer(source.associationLimit, 1, 8, base.associationLimit);", `  base.associationLimit = integer(source.associationLimit, 1, 8, base.associationLimit);
  base.strongLimit = integer(source.strongLimit, 1, 4, base.strongLimit);
  const strong = {};
  if (source.strongAssociations && typeof source.strongAssociations === 'object') {
    for (const [key, value] of Object.entries(source.strongAssociations)) {
      if (!key || !Array.isArray(value)) continue;
      const terms = value.map((term) => String(term).trim()).filter(Boolean).slice(0, 4);
      if (terms.length) strong[key.trim()] = terms;
      if (Object.keys(strong).length >= 200) break;
    }
  }
  base.strongAssociations = Object.keys(strong).length ? strong : { ...DEFAULT_STRONG_ASSOCIATIONS };`);
fs.writeFileSync(p,c,"utf8");
// search: strong expansion
p="lib/search.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("export function expandTerms(keywords, associations = {}, enabled = true, limit = 8) {","export function expandTerms(keywords, associations = {}, enabled = true, limit = 8, strongAssociations = {}, strongLimit = 1) {");
c=c.replace("    const terms = new Set([keyword]);\n    for (const [key, values] of keys) {","    const terms = new Set([keyword]);\n    const strong = Array.isArray(strongAssociations[keyword]) ? strongAssociations[keyword] : [];\n    for (const value of strong.slice(0, Math.max(1, Math.min(4, strongLimit)))) terms.add(value);\n    for (const [key, values] of keys) {");
c=c.replace("  const { map: expansion, all: terms } = expandTerms(keywords, config.associations, expand, settings.associationLimit ?? 4);","  const { map: expansion, all: terms } = expandTerms(keywords, config.associations, expand, settings.associationLimit ?? 4, settings.strongAssociations ?? {}, settings.strongLimit ?? 1);");
// weak expansion active only for caps
c=c.replace("  const expanding = expand && [...expansion.values()].some((values) => values.length > 1);","  const expanding = expand && keywords.some((keyword) => (config.associations?.[keyword]?.length ?? 0) > 0);");
fs.writeFileSync(p,c,"utf8");
console.log("strong associations wired");
