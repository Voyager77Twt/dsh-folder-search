import fs from "node:fs";
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  enableGeneral: true,","  enableGeneral: true,\n  allowGeneralFiles: false,");
c=c.replace("  if (typeof source.enableGeneral === 'boolean') base.enableGeneral = source.enableGeneral;","  if (typeof source.enableGeneral === 'boolean') base.enableGeneral = source.enableGeneral;\n  if (typeof source.allowGeneralFiles === 'boolean') base.allowGeneralFiles = source.allowGeneralFiles;");
fs.writeFileSync(p,c,"utf8");
console.log("allowGeneralFiles setting");
