import fs from "node:fs";
let p="lib/settings-host.js"; let c=fs.readFileSync(p,"utf8");
const start=c.indexOf("function startBuild(settings, force = false) {");
const end=c.indexOf("async function indexStatus(settings) {");
if(start<0||end<0) throw new Error('startBuild markers');
const replacement=`function startBuild(settings, force = false) {
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
c=c.slice(0,start)+replacement+c.slice(end);
fs.writeFileSync(p,c,"utf8");
console.log("multi-root startBuild");
