import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary } from "../lib/search.js";
const s=await loadSettings(); console.log("limits",s.associationLimit,s.generalLimit);
const cfg={libraries:[s.libraryRoot],cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency,associations:{}};
const idx=indexFor(s.libraryRoot,cfg);
for(const lim of [0,1,8]){
 const r=await searchLibrary(idx,{keywords:["侯氏制碱法"],generalTerms:["纯碱","碳酸钠","侯德榜","索尔维"],refresh:"never"},cfg,{...s,generalLimit:lim,allowGeneralFiles:true,dedupe:false});
 console.log("generalLimit",lim,"generalFiles",r.totals.generalFiles,"shown",r.totals.shownFiles);
}
