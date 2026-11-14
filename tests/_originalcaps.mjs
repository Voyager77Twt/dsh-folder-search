import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("    next.allowGeneralFiles = false;\n    next.strongRetry = false;\n    next.normalMaxFiles = 12;\n    next.normalMaxBlocksPerFile = 2;\n    next.finalMaxFiles = 20;","    next.allowGeneralFiles = false;\n    next.strongRetry = false;\n    next.normalMaxBlocksPerFile = 2;");
fs.writeFileSync(p,c,"utf8");
console.log("original uses saved caps");
