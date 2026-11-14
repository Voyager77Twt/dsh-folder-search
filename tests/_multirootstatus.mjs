import fs from "node:fs";
let p="lib/settings-host.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("    libraryRoot: job.libraryRoot,\n    cacheDir: job.cacheDir,","    libraryRoot: job.libraryRoot,\n    libraryRoots: job.libraryRoots,\n    cacheDir: job.cacheDir,");
const start=c.indexOf("async function indexStatus(settings) {");
const end=c.indexOf("\nexport function registerSettingsRoute", start);
if(start<0||end<0) throw new Error('indexStatus marker');
const replacement=`async function indexStatus(settings) {
  const roots = (Array.isArray(settings.libraryRoots) && settings.libraryRoots.length ? settings.libraryRoots : [settings.libraryRoot]).filter(Boolean).map((root) => path.resolve(root));
  if (!roots.length) return { configured: false };
  const rootsKey = roots.map((root) => root.toLowerCase()).sort().join('|');
  if (activeBuild?.running && activeBuild.rootsKey === rootsKey) return buildSnapshot(activeBuild);
  const libraries = [];
  let documents = 0;
  let ready = 0;
  let pending = 0;
  let failed = 0;
  let changed = 0;
  let cacheBytes = 0;
  let cacheReached = false;
  const errors = [];
  for (const root of roots) {
    try {
      const index = indexFor(root, { cacheDir: settings.cacheDir || undefined, maxFileMB: settings.maxFileMB, parseIsolation: settings.parseIsolation !== false, parseWorkerMB: settings.parseWorkerMB, officeAllowMacros: settings.officeAllowMacros === true, security: { zipMaxEntries: settings.zipMaxEntries, zipMaxEntryMB: settings.zipMaxEntryMB, zipMaxTotalMB: settings.zipMaxTotalMB, zipMaxRatio: settings.zipMaxRatio, maxTextMB: settings.maxTextMB } });
      const scan = await index.sync({ budget: 0 });
      const summary = summarizeSync(scan);
      documents += summary.documents ?? 0;
      ready += summary.ready ?? 0;
      pending += summary.pending ?? 0;
      failed += summary.failed ?? 0;
      changed += summary.changed ?? 0;
      cacheBytes += summary.cacheBytes ?? 0;
      cacheReached ||= Boolean(summary.capReached);
      for (const error of summary.errors ?? []) errors.push({ ...error, library: root });
      libraries.push({ root, cacheDir: index.cacheDir, ...summary });
    } catch (error) {
      errors.push({ library: root, message: error instanceof Error ? error.message : String(error) });
    }
  }
  return {
    configured: true,
    running: false,
    libraryRoot: roots[0],
    libraryRoots: roots,
    libraries,
    cacheDir: roots.length === 1 ? libraries[0]?.cacheDir : \`\${roots.length} 个库\`,
    startedAt: null,
    finishedAt: activeBuild?.finishedAt || null,
    documents,
    ready,
    pending,
    failed,
    changed,
    cacheBytes,
    libraryBytes: 0,
    cacheCapMB: 250,
    capReached: cacheReached,
    errors,
  };
}

`;
c=c.slice(0,start)+replacement+c.slice(end);
fs.writeFileSync(p,c,"utf8");
console.log("multi-root indexStatus");
