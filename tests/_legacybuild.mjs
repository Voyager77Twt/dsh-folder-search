import fs from "node:fs";
let p="lib/settings-host.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("import { indexFor } from './indexer.js';","import { indexFor } from './indexer.js';\nimport { collectPendingLegacy, preconvertLegacy } from './legacy-batch.js';");
const start=c.indexOf("async function runBuild(job) {");
const end=c.indexOf("\nfunction startBuild(settings", start);
if(start<0||end<0) throw new Error('runBuild markers missing');
const newRun=`async function runBuild(job) {
  const dirs = [];
  const skip = new Set();
  const originalDir = process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR;
  const originalStrict = process.env.DSH_LIBSEARCH_LEGACY_STRICT;
  let legacyConverted = 0;
  try {
    const index = indexFor(job.libraryRoot, {
      cacheDir: job.cacheDir || undefined,
      indexConcurrency: job.indexConcurrency,
    });
    for (let round = 0; round < 10000; round += 1) {
      if (job.cancelled) break;
      const pendingLegacy = await collectPendingLegacy(index, 60, skip);
      if (pendingLegacy.length) {
        job.last = { ...job.last, phase: 'legacy', legacyPending: pendingLegacy.length, legacyConverted };
        const batch = await preconvertLegacy(index, pendingLegacy);
        dirs.push(batch.dir);
        legacyConverted += batch.converted;
        for (const failure of batch.failed) skip.add(failure.src);
        process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR = batch.dir;
        process.env.DSH_LIBSEARCH_LEGACY_STRICT = '1';
      }
      const result = await index.sync({
        budget: 200,
        onProgress: (progress) => {
          job.last = { ...job.last, ...progress, phase: 'sync', legacyConverted };
        },
      });
      job.last = { ...summarizeSync(result), phase: 'sync', legacyConverted };
      if (job.last.capReached) {
        job.error = '缓存上限已到，建库暂停';
        break;
      }
      if (job.last.pending <= 0) {
        const next = await collectPendingLegacy(index, 1, skip);
        if (!next.length) break;
      }
      if (!result.changed && job.last.pending > 0) await sleep(150);
    }
    if (!job.error) {
      const stats = await index.stats();
      job.last = { ...(job.last || {}), cacheBytes: stats.cacheBytes, updatedAt: stats.updatedAt };
    }
  } catch (error) {
    job.error = error instanceof Error ? error.message : String(error);
  } finally {
    if (originalDir === undefined) delete process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR;
    else process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR = originalDir;
    if (originalStrict === undefined) delete process.env.DSH_LIBSEARCH_LEGACY_STRICT;
    else process.env.DSH_LIBSEARCH_LEGACY_STRICT = originalStrict;
    for (const dir of dirs) await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
    job.running = false;
    job.finishedAt = Date.now();
  }
}

`;
c=c.slice(0,start)+newRun+c.slice(end);
fs.writeFileSync(p,c,"utf8");
console.log("batch legacy build");
