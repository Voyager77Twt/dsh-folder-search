import fs from "node:fs";
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  normalMaxFiles: 'all',\n  normalMaxBlocksPerFile: 4,","  normalMaxFiles: 12,\n  normalMaxBlocksPerFile: 2,");
c=c.replace("  expandMaxFiles: 'all',\n  expandMaxBlocksPerFile: 2,","  expandMaxFiles: 6,\n  expandMaxBlocksPerFile: 2,");
c=c.replace("  strongMaxFiles: 'all',\n  strongMaxBlocksPerFile: 2,","  strongMaxFiles: 6,\n  strongMaxBlocksPerFile: 2,");
c=c.replace("  finalMaxFiles: 60,","  finalMaxFiles: 20,");
fs.writeFileSync(p,c,"utf8");
console.log("compact defaults");
