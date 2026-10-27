import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
const s=await loadSettings(); const cfg={cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency};
const read=async()=>{const i=indexFor(s.libraryRoot,cfg);const m=await i.loadManifest();const es=Object.values(m.files||{});return {files:es.length,ready:es.filter(e=>!e.err).length,failed:es.filter(e=>e.err).length,updated:m.updatedAt};};
const a=await read(); await new Promise(r=>setTimeout(r,5000)); const b=await read();
console.log(JSON.stringify({a,b,growing:b.files!==a.files||b.updated!==a.updated}));
