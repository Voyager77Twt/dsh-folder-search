import fs from "node:fs";
let p="lib/index.js"; let c=fs.readFileSync(p,"utf8");
const marker="    outputDir: input.outputDir ? path.resolve(input.outputDir) : null,\n  };";
const add=`    outputDir: input.outputDir ? path.resolve(input.outputDir) : null,
    parseIsolation: input.parseIsolation !== false,
    parseWorkerMB: Math.max(64, Math.min(1024, numberOr(input.parseWorkerMB, 256))),
    officeAllowMacros: input.officeAllowMacros === true,
    security: {
      zipMaxEntries: Math.max(16, Math.min(20000, numberOr(input.zipMaxEntries, 5000))),
      zipMaxEntryMB: Math.max(1, Math.min(1024, numberOr(input.zipMaxEntryMB, 64))),
      zipMaxTotalMB: Math.max(8, Math.min(4096, numberOr(input.zipMaxTotalMB, 512))),
      zipMaxRatio: Math.max(2, Math.min(1000, numberOr(input.zipMaxRatio, 200))),
      maxTextMB: Math.max(1, Math.min(200, numberOr(input.maxTextMB, 20))),
    },
  };`;
if(!c.includes(marker)) throw new Error('config marker missing');
c=c.replace(marker,add);
c=c.replace("  const config = { ...resolved, cacheDir: settings.cacheDir ? path.resolve(settings.cacheDir) : resolved.cacheDir, indexConcurrency: settings.indexConcurrency, maxFileMB: settings.maxFileMB };","  const config = {\n    ...resolved,\n    cacheDir: settings.cacheDir ? path.resolve(settings.cacheDir) : resolved.cacheDir,\n    indexConcurrency: settings.indexConcurrency,\n    maxFileMB: settings.maxFileMB,\n    parseIsolation: settings.parseIsolation !== false,\n    parseWorkerMB: settings.parseWorkerMB,\n    officeAllowMacros: settings.officeAllowMacros === true,\n    security: {\n      zipMaxEntries: settings.zipMaxEntries,\n      zipMaxEntryMB: settings.zipMaxEntryMB,\n      zipMaxTotalMB: settings.zipMaxTotalMB,\n      zipMaxRatio: settings.zipMaxRatio,\n      maxTextMB: settings.maxTextMB,\n    },\n  };");
fs.writeFileSync(p,c,"utf8");
p="lib/settings-host.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("      indexConcurrency: job.indexConcurrency,\n      maxFileMB: job.maxFileMB,\n    });","      indexConcurrency: job.indexConcurrency,\n      maxFileMB: job.maxFileMB,\n      parseIsolation: job.parseIsolation,\n      parseWorkerMB: job.parseWorkerMB,\n      officeAllowMacros: job.officeAllowMacros,\n      security: job.security,\n    });");
c=c.replace("const batch = await preconvertLegacy(index, pendingLegacy);","const batch = await preconvertLegacy(index, pendingLegacy, { allowMacros: job.officeAllowMacros === true });");
c=c.replace("    indexConcurrency: settings.indexConcurrency,\n    maxFileMB: settings.maxFileMB,","    indexConcurrency: settings.indexConcurrency,\n    maxFileMB: settings.maxFileMB,\n    parseIsolation: settings.parseIsolation !== false,\n    parseWorkerMB: settings.parseWorkerMB,\n    officeAllowMacros: settings.officeAllowMacros === true,\n    security: {\n      zipMaxEntries: settings.zipMaxEntries,\n      zipMaxEntryMB: settings.zipMaxEntryMB,\n      zipMaxTotalMB: settings.zipMaxTotalMB,\n      zipMaxRatio: settings.zipMaxRatio,\n      maxTextMB: settings.maxTextMB,\n    },");
c=c.replace("const index = indexFor(settings.libraryRoot, { cacheDir: settings.cacheDir || undefined, maxFileMB: settings.maxFileMB });","const index = indexFor(settings.libraryRoot, { cacheDir: settings.cacheDir || undefined, maxFileMB: settings.maxFileMB, parseIsolation: settings.parseIsolation !== false, parseWorkerMB: settings.parseWorkerMB, officeAllowMacros: settings.officeAllowMacros === true, security: { zipMaxEntries: settings.zipMaxEntries, zipMaxEntryMB: settings.zipMaxEntryMB, zipMaxTotalMB: settings.zipMaxTotalMB, zipMaxRatio: settings.zipMaxRatio, maxTextMB: settings.maxTextMB } });");
fs.writeFileSync(p,c,"utf8");
console.log("config wiring");
