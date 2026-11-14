import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary } from "../lib/search.js";
const s=await loadSettings();
const cfg={libraries:[s.libraryRoot],cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency,associations:{}};
const idx=indexFor(s.libraryRoot,cfg);
const r=await searchLibrary(idx,{keywords:["侯氏制碱法"],strongTerms:["侯德榜","联合制碱法"],generalTerms:["纯碱","碳酸钠"],refresh:"never"},cfg,{...s,allowGeneralFiles:false,dedupe:false});
console.log(JSON.stringify({direct:r.totals.directFiles,strong:r.totals.relatedFiles,general:r.totals.generalFiles,shown:r.totals.shownFiles,gate:r.strongGate,trunc:r.truncated},null,2));
console.log(r.files.map(f=>({name:f.name,generalOnly:f.generalOnly,relatedOnly:f.relatedOnly,strong:f.strongTerms,general:f.generalTerms,direct:f.directKeywords.length,blocksHit:f.blocksHit})));
