import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
const s=await loadSettings(); const i=indexFor(s.libraryRoot,{cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency}); const m=await i.loadManifest(); const es=Object.values(m.files||{});
console.log(JSON.stringify({files:es.length,ready:es.filter(e=>!e.err).length,failed:es.filter(e=>e.err).length,updated:m.updatedAt}));
