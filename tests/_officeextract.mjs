import { extractFile } from "../lib/extract.js";
import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
const s=await loadSettings();
const idx=indexFor(s.libraryRoot,{cacheDir:s.cacheDir||undefined,maxFileMB:s.maxFileMB});
const files=await idx.walk();
for (const ext of ['.xlsx','.pptx']) {
 const doc=files.find(f=>f.toLowerCase().endsWith(ext));
 if(!doc){ console.log(ext,'none'); continue; }
 try { const r=await extractFile(doc,ext,{maxFileMB:s.maxFileMB,security:s}); console.log(ext,'ok',r.blocks.length,r.chars); }
 catch(e){ console.log(ext,'ERR',e.message); }
}
