import fs from "node:fs";
let p="lib/legacy-batch.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("const pdf = await convertLegacyToPdf(item.src, { timeoutMs: 90000 });","const pdf = await convertLegacyToPdf(item.src, { timeoutMs: 90000, allowMacros: options.allowMacros === true });");
fs.writeFileSync(p,c,"utf8");
p="lib/index.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("const batch = await preconvertLegacy(index, pending);","const batch = await preconvertLegacy(index, pending, { allowMacros: settings.officeAllowMacros === true });");
fs.writeFileSync(p,c,"utf8");
console.log("office options all paths");
