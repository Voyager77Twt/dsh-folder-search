import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary, renderSearchResult } from "../lib/search.js";
const s=await loadSettings();
const cfg={libraries:[s.libraryRoot],cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency,associations:{}};
const idx=indexFor(s.libraryRoot,cfg);
const args={keywords:["侯氏制碱法"],strongTerms:["联合制碱法","侯德榜"],generalTerms:["纯碱","碳酸钠"],refresh:"never"};
for(const mode of ["original","default","full","custom"]){
 const r=await searchLibrary(idx,args,cfg,{...s,searchMode:mode,dedupe:false});
 console.log(mode,"direct",r.totals.directFiles,"auto",r.totals.expandedFiles,"strong",r.totals.relatedFiles,"general",r.totals.generalFiles,"shown",r.totals.shownFiles,"fallback",r.totals.fallback,"trunc",r.truncated);
}
