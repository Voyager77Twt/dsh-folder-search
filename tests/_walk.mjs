import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
const s=await loadSettings();
const idx=indexFor(s.libraryRoot,{cacheDir:s.cacheDir||undefined,maxFileMB:s.maxFileMB});
const files=await idx.walk();
console.log(files.length, files.slice(0,5).map(f=>[f.ext,f.rel]));
console.log([...new Set(files.map(f=>f.ext))]);
