import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { collectPendingLegacy, preconvertLegacy } from "../lib/legacy-batch.js";
import fs from "node:fs/promises";
const s=await loadSettings();
const idx=indexFor(s.libraryRoot,{cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency});
const pending=await collectPendingLegacy(idx,1);
console.log("pending",pending.map(p=>p.rel));
if(pending.length){
  const started=Date.now();
  const r=await preconvertLegacy(idx,pending);
  console.log("result",{converted:r.converted,failed:r.failed.length,ms:Date.now()-started,dir:r.dir});
  await fs.rm(r.dir,{recursive:true,force:true});
}
