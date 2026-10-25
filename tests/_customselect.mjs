import fs from "node:fs";
// settings
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  customAssociations: {},","  customAssociations: {},\n  customEnabled: true,\n  customDisabled: [],");
c=c.replace("  base.customAssociations = custom;","  base.customAssociations = custom;\n  if (typeof source.customEnabled === 'boolean') base.customEnabled = source.customEnabled;\n  base.customDisabled = Array.isArray(source.customDisabled) ? source.customDisabled.map((key) => String(key).trim()).filter(Boolean).slice(0, 200) : [];");
fs.writeFileSync(p,c,"utf8");
// search merge filtered
p="lib/search.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("  const associations = { ...(config.associations || {}), ...(settings.customAssociations || {}) };","  const disabledCustom = new Set(Array.isArray(settings.customDisabled) ? settings.customDisabled : []);\n  const custom = settings.customEnabled === false ? {} : Object.fromEntries(Object.entries(settings.customAssociations || {}).filter(([key]) => !disabledCustom.has(key)));\n  const associations = { ...(config.associations || {}), ...custom };");
fs.writeFileSync(p,c,"utf8");
console.log("custom selection settings");
