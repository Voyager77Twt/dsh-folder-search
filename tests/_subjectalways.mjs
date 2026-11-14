import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("    { ...(config.associations || {}), ...subjectAssociations },\n    expand,\n    settings.associationLimit ?? 4,\n    settings.customAssociations || {},\n    includeCustom,\n    GENERAL_ASSOCIATIONS,","    { ...(config.associations || {}) },\n    expand,\n    settings.associationLimit ?? 4,\n    settings.customAssociations || {},\n    includeCustom,\n    { ...GENERAL_ASSOCIATIONS, ...subjectAssociations },");
fs.writeFileSync(p,c,"utf8");
console.log("subject always activation");
