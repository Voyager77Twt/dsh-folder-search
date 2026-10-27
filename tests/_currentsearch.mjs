import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary } from "../lib/search.js";
const s=await loadSettings();
const root=s.libraryRoot;
const cfg={libraries:[root],cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency,associations:{}};
const idx=indexFor(root,cfg);
const r=await searchLibrary(idx,{keywords:["侯氏制碱法"],refresh:"never"},cfg,s);
console.log("root",root,"cache",idx.cacheDir,"files",r.totals.files,"direct",r.totals.directFiles,"related",r.totals.relatedFiles);
