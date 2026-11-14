import fs from "node:fs";
let p="lib/settings-host.js"; let c=fs.readFileSync(p,"utf8");
const marker="async function indexStatus(settings) {";
const fn=`function startBuild(settings, force = false) {
  const roots = (Array.isArray(settings.libraryRoots) && settings.libraryRoots.length ? settings.libraryRoots : [settings.libraryRoot])
    .map((root) => path.resolve(root))
    .filter(Boolean);
  if (!roots.length) throw new Error('还没有填写题库位置');
  const rootsKey = roots.map((root) => root.toLowerCase()).sort().join('|');
  if (activeBuild?.running) {
    if (activeBuild.rootsKey === rootsKey) return activeBuild;
    throw new Error('已有另一个索引任务在运行，请等它完成');
  }
  if (activeBuild && !force && activeBuild.rootsKey === rootsKey && activeBuild.cacheDir === (settings.cacheDir ? path.resolve(settings.cacheDir) : '')) {
    return activeBuild;
  }
  const job = {
    running: true,
    libraryRoot: roots[0],
    libraryRoots: roots,
    rootsKey,
    cacheDir: settings.cacheDir ? path.resolve(settings.cacheDir) : '',
    indexConcurrency: settings.indexConcurrency,
    maxFileMB: settings.maxFileMB,
    parseIsolation: settings.parseIsolation !== false,
    parseWorkerMB: settings.parseWorkerMB,
    officeAllowMacros: settings.officeAllowMacros === true,
    security: {
      zipMaxEntries: settings.zipMaxEntries,
      zipMaxEntryMB: settings.zipMaxEntryMB,
      zipMaxTotalMB: settings.zipMaxTotalMB,
      zipMaxRatio: settings.zipMaxRatio,
      maxTextMB: settings.maxTextMB,
    },
    startedAt: Date.now(),
    finishedAt: null,
    error: null,
    last: { documents: 0, ready: 0, pending: 0, failed: 0, changed: 0, cacheBytes: 0, libraryBytes: 0, cacheCapMB: 250, capReached: false, errors: [] },
    cancelled: false,
  };
  activeBuild = job;
  setImmediate(() => runBuild(job));
  return job;
}

`;
if(c.includes("function startBuild(")) throw new Error('startBuild already exists');
c=c.replace(marker,fn+marker);
// pathChanged arrays
c=c.replace("          const pathChanged = before.libraryRoot !== settings.libraryRoot || before.cacheDir !== settings.cacheDir || before.maxFileMB !== settings.maxFileMB;","          const beforeRoots = Array.isArray(before.libraryRoots) ? before.libraryRoots : [before.libraryRoot].filter(Boolean);\n          const afterRoots = Array.isArray(settings.libraryRoots) ? settings.libraryRoots : [settings.libraryRoot].filter(Boolean);\n          const pathChanged = JSON.stringify(beforeRoots) !== JSON.stringify(afterRoots) || before.cacheDir !== settings.cacheDir || before.maxFileMB !== settings.maxFileMB;");
c=c.replace("          if (settings.libraryRoot && pathChanged) {","          if ((settings.libraryRoots?.length || settings.libraryRoot) && pathChanged) {");
fs.writeFileSync(p,c,"utf8");
console.log("startBuild restored and path compare");
