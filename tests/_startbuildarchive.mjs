import fs from "node:fs";
let p="lib/settings-host.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("      zipMaxRatio: settings.zipMaxRatio,\n      maxTextMB: settings.maxTextMB,\n    },","      zipMaxRatio: settings.zipMaxRatio,\n      archiveMaxDepth: settings.archiveMaxDepth,\n      archiveTreeMaxEntries: settings.archiveTreeMaxEntries,\n      archiveTreeMaxMB: settings.archiveTreeMaxMB,\n      maxTextMB: settings.maxTextMB,\n    },");
fs.writeFileSync(p,c,"utf8");
console.log("startBuild archive settings");
