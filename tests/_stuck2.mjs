import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
const s=await loadSettings(); const i=indexFor(s.libraryRoot,{cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency}); const m=await i.loadManifest(); const es=Object.entries(m.files||{});
const failed=es.filter(([,e])=>e.err); const reasons={}; for(const [,e] of failed) reasons[e.err]=(reasons[e.err]||0)+1;
console.log(JSON.stringify({entries:es.length,ready:es.length-failed.length,failed:failed.length,updated:m.updatedAt,reasons}));
