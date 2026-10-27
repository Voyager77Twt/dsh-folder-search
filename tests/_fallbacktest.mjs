import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary, renderSearchResult } from "../lib/search.js";
const s=await loadSettings();
const cfg={libraries:[s.libraryRoot],cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency,associations:{}};
const idx=indexFor(s.libraryRoot,cfg);
const fb=await searchLibrary(idx,{keywords:["空气除硫"],generalTerms:["脱硫"],refresh:"never"},cfg,{...s,allowGeneralFiles:false,dedupe:false});
console.log("fallback",fb.totals.fallback,"general",fb.totals.generalFiles,"shown",fb.totals.shownFiles,"header",renderSearchResult(fb).split("\n").slice(2,4));
for(const allow of [false,true]){
 const r=await searchLibrary(idx,{keywords:["侯氏制碱法"],generalTerms:["纯碱"],refresh:"never"},cfg,{...s,allowGeneralFiles:allow,dedupe:false});
 console.log("allow",allow,"direct",r.totals.directFiles,"general",r.totals.generalFiles,"shown",r.totals.shownFiles,"fallback",r.totals.fallback);
}
