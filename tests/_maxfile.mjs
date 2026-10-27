import fs from "node:fs";
// settings
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  indexConcurrency: 3,","  indexConcurrency: 3,\n  maxFileMB: 200,");
c=c.replace("  base.indexConcurrency = integer(source.indexConcurrency, 1, 8, base.indexConcurrency);","  base.indexConcurrency = integer(source.indexConcurrency, 1, 8, base.indexConcurrency);\n  base.maxFileMB = integer(source.maxFileMB, 1, 2000, base.maxFileMB);");
fs.writeFileSync(p,c,"utf8");
// index.js config default and prepare
p="lib/index.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("maxFileMB: Math.max(1, numberOr(input.maxFileMB, 60)),","maxFileMB: Math.max(1, numberOr(input.maxFileMB, 200)),");
c=c.replace("cacheDir: settings.cacheDir ? path.resolve(settings.cacheDir) : resolved.cacheDir, indexConcurrency: settings.indexConcurrency };","cacheDir: settings.cacheDir ? path.resolve(settings.cacheDir) : resolved.cacheDir, indexConcurrency: settings.indexConcurrency, maxFileMB: settings.maxFileMB };");
fs.writeFileSync(p,c,"utf8");
// settings host job config
p="lib/settings-host.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("      indexConcurrency: job.indexConcurrency,\n    });","      indexConcurrency: job.indexConcurrency,\n      maxFileMB: job.maxFileMB,\n    });");
c=c.replace("    indexConcurrency: settings.indexConcurrency,\n    startedAt: Date.now(),","    indexConcurrency: settings.indexConcurrency,\n    maxFileMB: settings.maxFileMB,\n    startedAt: Date.now(),");
c=c.replace("const index = indexFor(settings.libraryRoot, { cacheDir: settings.cacheDir || undefined });","const index = indexFor(settings.libraryRoot, { cacheDir: settings.cacheDir || undefined, maxFileMB: settings.maxFileMB });");
c=c.replace("const pathChanged = before.libraryRoot !== settings.libraryRoot || before.cacheDir !== settings.cacheDir;","const pathChanged = before.libraryRoot !== settings.libraryRoot || before.cacheDir !== settings.cacheDir || before.maxFileMB !== settings.maxFileMB;");
fs.writeFileSync(p,c,"utf8");
// preset config fallback
p="cordis.patch.yml"; c=fs.readFileSync(p,"utf8");
c=c.replace("maxFileMB: 60","maxFileMB: 200");
fs.writeFileSync(p,c,"utf8");
console.log("maxFileMB setting");
