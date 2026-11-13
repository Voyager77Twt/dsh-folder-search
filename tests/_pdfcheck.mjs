import path from "node:path";
import { extractFile } from "../lib/extract.js";
import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
const s=await loadSettings();
const idx=indexFor(s.libraryRoot,{cacheDir:s.cacheDir||undefined,maxFileMB:s.maxFileMB});
const files=await idx.walk();
const doc=files.find(f=>f.toLowerCase().endsWith('.pdf'));
if(!doc){ console.log('no pdf'); process.exit(0); }
const r=await extractFile(doc,'.pdf',{maxFileMB:s.maxFileMB,security:s});
console.log('pdf ok',r.blocks.length,r.chars);
