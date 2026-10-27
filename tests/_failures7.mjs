import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
const s=await loadSettings(); const i=indexFor(s.libraryRoot,{cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency}); const m=await i.loadManifest();
for(const [rel,e] of Object.entries(m.files||{})) if(e.err) console.log(rel+"\t"+e.err);
