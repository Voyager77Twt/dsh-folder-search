import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
const s=await loadSettings(); const idx=indexFor(s.libraryRoot,{cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency,associations:{}}); const m=await idx.loadManifest();
const entries=Object.entries(m.files||{});
const failed=entries.filter(([,e])=>e.err);
console.log("entries",entries.length,"failed",failed.length,"ready",entries.filter(([,e])=>!e.err).length);
console.log("failed samples",failed.slice(0,8).map(([k,e])=>[k,e.err]).slice(0,8));
const docs=s.libraryRoot; // no
