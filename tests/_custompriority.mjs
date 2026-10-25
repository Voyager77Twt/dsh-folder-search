import fs from "node:fs";
// settings: remove manual selection fields
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  customAssociations: {},\n  customEnabled: true,\n  customDisabled: [],","  customAssociations: {},");
c=c.replace("  if (typeof source.customEnabled === 'boolean') base.customEnabled = source.customEnabled;\n  base.customDisabled = Array.isArray(source.customDisabled) ? source.customDisabled.map((key) => String(key).trim()).filter(Boolean).slice(0, 200) : [];\n","");
fs.writeFileSync(p,c,"utf8");
// search: custom priority over built-in, same expansion logic
p="lib/search.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("  const disabledCustom = new Set(Array.isArray(settings.customDisabled) ? settings.customDisabled : []);\n  const custom = settings.customEnabled === false ? {} : Object.fromEntries(Object.entries(settings.customAssociations || {}).filter(([key]) => !disabledCustom.has(key)));\n  const associations = { ...(config.associations || {}), ...custom };\n  const { map: expansion, all: terms } = expandTerms(keywords, associations, expand, settings.associationLimit ?? 4);",
"  const { map: expansion, all: terms } = expandTerms(keywords, config.associations, expand, settings.associationLimit ?? 4, settings.customAssociations || {});");
c=c.replace("export function expandTerms(keywords, associations = {}, enabled = true, limit = 8) {","export function expandTerms(keywords, associations = {}, enabled = true, limit = 8, customAssociations = {}) {");
c=c.replace("    const terms = new Set([keyword]);\n    for (const [key, values] of keys) {","    const terms = new Set([keyword]);\n    const customValues = Array.isArray(customAssociations[keyword]) ? customAssociations[keyword] : [];\n    const builtinValues = Array.isArray(associations[keyword]) ? associations[keyword] : [];\n    const merged = [...new Set([...customValues, ...builtinValues])];\n    for (const value of merged.slice(0, limit + 1)) terms.add(value);\n    for (const [key, values] of keys) {");
fs.writeFileSync(p,c,"utf8");
console.log("custom priority logic");
