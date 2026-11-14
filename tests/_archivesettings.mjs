import fs from "node:fs";
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  zipMaxRatio: 200,","  zipMaxRatio: 200,\n  archiveMaxDepth: 2,\n  archiveTreeMaxEntries: 10000,\n  archiveTreeMaxMB: 1024,");
c=c.replace("  base.zipMaxRatio = integer(source.zipMaxRatio, 2, 1000, base.zipMaxRatio);","  base.zipMaxRatio = integer(source.zipMaxRatio, 2, 1000, base.zipMaxRatio);\n  base.archiveMaxDepth = integer(source.archiveMaxDepth, 1, 10, base.archiveMaxDepth);\n  base.archiveTreeMaxEntries = integer(source.archiveTreeMaxEntries, 100, 100000, base.archiveTreeMaxEntries);\n  base.archiveTreeMaxMB = integer(source.archiveTreeMaxMB, 32, 8192, base.archiveTreeMaxMB);");
fs.writeFileSync(p,c,"utf8");
console.log("archive security settings");
