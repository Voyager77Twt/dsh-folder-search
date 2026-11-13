import { indexFor } from "../lib/indexer.js";
import { loadSettings } from "../lib/settings-store.js";
const s=await loadSettings();
const idx=indexFor(s.libraryRoot,{cacheDir:s.cacheDir||undefined,maxFileMB:s.maxFileMB});
const stats=await idx.stats();
console.log(JSON.stringify({root:s.libraryRoot,cache:idx.cacheDir,ready:stats.ready,documents:stats.documents,failed:stats.failed,cacheBytes:stats.cacheBytes}));
