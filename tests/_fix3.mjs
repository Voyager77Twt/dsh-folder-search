import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { collectPendingLegacy, preconvertLegacy } from "../lib/legacy-batch.js";
import fs from "node:fs/promises";
const s=await loadSettings(); const idx=indexFor(s.libraryRoot,{cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency});
const pending=await collectPendingLegacy(idx,10);
console.log("pending",pending.map(p=>p.rel));
if(pending.length){
  const oldDir=process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR, oldStrict=process.env.DSH_LIBSEARCH_LEGACY_STRICT;
  const batch=await preconvertLegacy(idx,pending);
  console.log("preconvert",{converted:batch.converted,failed:batch.failed.length,dir:batch.dir});
  process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR=batch.dir; process.env.DSH_LIBSEARCH_LEGACY_STRICT='1';
  const sync=await idx.sync({budget:10,retryErrors:true});
  console.log("sync",{ready:sync.ready,failed:sync.failed,pending:sync.pending,changed:sync.changed});
  if(oldDir===undefined) delete process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR; else process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR=oldDir;
  if(oldStrict===undefined) delete process.env.DSH_LIBSEARCH_LEGACY_STRICT; else process.env.DSH_LIBSEARCH_LEGACY_STRICT=oldStrict;
  await fs.rm(batch.dir,{recursive:true,force:true});
}
