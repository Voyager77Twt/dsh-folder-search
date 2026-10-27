import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
const s=await loadSettings(); const cfg={libraries:[s.libraryRoot],cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency,associations:{}};
const idx=indexFor(s.libraryRoot,cfg); const st=await idx.stats(); const m=await idx.loadManifest();
console.log("stats",JSON.stringify(st)); console.log("manifest files",Object.keys(m.files||{}).length,"updated",m.updatedAt);
