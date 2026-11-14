import fs from "node:fs";
let p="lib/index.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("      zipMaxRatio: Math.max(2, Math.min(1000, numberOr(input.zipMaxRatio, 200))),","      zipMaxRatio: Math.max(2, Math.min(1000, numberOr(input.zipMaxRatio, 200))),\n      archiveMaxDepth: Math.max(1, Math.min(10, numberOr(input.archiveMaxDepth, 2))),\n      archiveTreeMaxEntries: Math.max(100, Math.min(100000, numberOr(input.archiveTreeMaxEntries, 10000))),\n      archiveTreeMaxMB: Math.max(32, Math.min(8192, numberOr(input.archiveTreeMaxMB, 1024))),");
c=c.replaceAll("      zipMaxRatio: settings.zipMaxRatio,","      zipMaxRatio: settings.zipMaxRatio,\n      archiveMaxDepth: settings.archiveMaxDepth,\n      archiveTreeMaxEntries: settings.archiveTreeMaxEntries,\n      archiveTreeMaxMB: settings.archiveTreeMaxMB,");
fs.writeFileSync(p,c,"utf8");
p="lib/settings-host.js"; c=fs.readFileSync(p,"utf8");
c=c.replaceAll("zipMaxRatio: settings.zipMaxRatio, maxTextMB: settings.maxTextMB","zipMaxRatio: settings.zipMaxRatio, archiveMaxDepth: settings.archiveMaxDepth, archiveTreeMaxEntries: settings.archiveTreeMaxEntries, archiveTreeMaxMB: settings.archiveTreeMaxMB, maxTextMB: settings.maxTextMB");
fs.writeFileSync(p,c,"utf8");
console.log("archive config propagation");
