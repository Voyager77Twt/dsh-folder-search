import fs from "node:fs";
let p="lib/settings-host.js"; let c=fs.readFileSync(p,"utf8");
const start=c.indexOf("async function runBuild(job) {");
const end=c.indexOf("async function indexStatus(settings) {");
if(start<0||end<0) throw new Error('runBuild markers');
const replacement=`async function buildRoot(job, root, dirs) {
  const skip = new Set();
  const originalDir = process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR;
  const originalStrict = process.env.DSH_LIBSEARCH_LEGACY_STRICT;
  let legacyConverted = 0;
  let last = { documents: 0, ready: 0, pending: 0, failed: 0, changed: 0, cacheBytes: 0, libraryBytes: 0, cacheCapMB: 250, capReached: false, errors: [] };
  try {
    const index = indexFor(root, {
      cacheDir: job.cacheDir || undefined,
      indexConcurrency: job.indexConcurrency,
      maxFileMB: job.maxFileMB,
      parseIsolation: job.parseIsolation,
      parseWorkerMB: job.parseWorkerMB,
      officeAllowMacros: job.officeAllowMacros,
      security: job.security,
    });
    for (let round = 0; round < 10000; round += 1) {
      if (job.cancelled) break;
      const pendingLegacy = await collectPendingLegacy(index, 20, skip);
      if (pendingLegacy.length) {
        job.last = { ...job.last, phase: 'legacy', libraryCurrent: root, legacyPending: pendingLegacy.length, legacyConverted, legacyCurrent: pendingLegacy[0]?.rel || null };
        const batch = await preconvertLegacy(index, pendingLegacy, { allowMacros: job.officeAllowMacros === true });
        dirs.push(batch.dir);
        legacyConverted += batch.converted;
        for (const failure of batch.failed) skip.add(failure.src);
        process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR = batch.dir;
        process.env.DSH_LIBSEARCH_LEGACY_STRICT = '1';
      }
      const result = await index.sync({
        budget: 200,
        retryErrors: true,
        onProgress: (progress) => {
          job.last = { ...job.last, ...progress, phase: 'sync', libraryCurrent: root, legacyConverted, legacyCurrent: null };
        },
      });
      last = summarizeSync(result);
      job.last = { ...last, phase: 'sync', libraryCurrent: root, legacyConverted, legacyCurrent: null };
      if (last.capReached) {
        job.error = '缓存上限已到，建库暂停';
        break;
      }
      if (last.pending <= 0) {
        const next = await collectPendingLegacy(index, 1, skip);
        if (!next.length) break;
      }
      if (!result.changed && last.pending > 0) await sleep(150);
    }
    if (!job.error) {
      const stats = await index.stats();
      last = { ...last, cacheBytes: stats.cacheBytes, updatedAt: stats.updatedAt };
    }
    return { ...last, libraryRoot: root, cacheDir: index.cacheDir };
  } finally {
    if (originalDir === undefined) delete process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR;
    else process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR = originalDir;
    if (originalStrict === undefined) delete process.env.DSH_LIBSEARCH_LEGACY_STRICT;
    else process.env.DSH_LIBSEARCH_LEGACY_STRICT = originalStrict;
  }
}

async function runBuild(job) {
  const dirs = [];
  const aggregate = { documents: 0, ready: 0, pending: 0, failed: 0, changed: 0, cacheBytes: 0, libraryBytes: 0, cacheCapMB: 250, capReached: false, errors: [] };
  try {
    for (const root of job.libraryRoots) {
      if (job.cancelled) break;
      const result = await buildRoot(job, root, dirs);
      aggregate.documents += result.documents ?? 0;
      aggregate.ready += result.ready ?? 0;
      aggregate.pending += result.pending ?? 0;
      aggregate.failed += result.failed ?? 0;
      aggregate.changed += result.changed ?? 0;
      aggregate.cacheBytes += result.cacheBytes ?? 0;
      aggregate.libraryBytes += result.libraryBytes ?? 0;
      aggregate.capReached ||= Boolean(result.capReached);
      for (const error of result.errors ?? []) aggregate.errors.push({ ...error, library: root });
      job.last = { ...aggregate, phase: 'sync', libraryCurrent: root, legacyConverted: 0, legacyCurrent: null };
      if (job.error) break;
    }
    job.last = { ...aggregate, phase: 'done', libraryCurrent: null, legacyConverted: 0, legacyCurrent: null };
  } catch (error) {
    job.error = error instanceof Error ? error.message : String(error);
  } finally {
    for (const dir of dirs) await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
    job.running = false;
    job.finishedAt = Date.now();
  }
}

`;
c=c.slice(0,start)+replacement+c.slice(end);
fs.writeFileSync(p,c,"utf8");
console.log("multi-root build runner");
