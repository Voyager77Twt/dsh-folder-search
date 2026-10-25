import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  const disabledCustom = new Set(Array.isArray(settings.customDisabled) ? settings.customDisabled : []);\n  const custom = settings.customEnabled === false ? {} : Object.fromEntries(Object.entries(settings.customAssociations || {}).filter(([key]) => !disabledCustom.has(key)));\n  const associations = { ...(config.associations || {}), ...custom };\n","");
c=c.replace("  const { map: expansion, all: terms } = expandTerms(keywords, associations, expand, settings.associationLimit ?? 4);","  const { map: expansion, all: terms } = expandTerms(keywords, config.associations, expand, settings.associationLimit ?? 4, settings.customAssociations || {});");
fs.writeFileSync(p,c,"utf8");
console.log("custom call fixed");
