import fs from "node:fs";
let p="lib/parse-isolate.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("      resourceLimits: { maxOldGenerationSizeMb: 256, maxYoungGenerationSizeMb: 64 },","      resourceLimits: {\n        maxOldGenerationSizeMb: Math.max(64, Math.min(1024, Number(options.workerMaxMB ?? 256))),\n        maxYoungGenerationSizeMb: 64,\n      },");
fs.writeFileSync(p,c,"utf8");
p="lib/indexer.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("          officeAllowMacros: this.config.officeAllowMacros === true,\n        });","          officeAllowMacros: this.config.officeAllowMacros === true,\n          workerMaxMB: this.config.parseWorkerMB ?? 256,\n        });");
fs.writeFileSync(p,c,"utf8");
console.log("worker memory option");
