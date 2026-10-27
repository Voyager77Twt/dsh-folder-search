import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary } from "../lib/search.js";
const s=await loadSettings();
const cfg={libraries:[s.libraryRoot],cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency,associations:{}};
const idx=indexFor(s.libraryRoot,cfg);
for(const expand of [true,false]){
 const r=await searchLibrary(idx,{keywords:["侯氏制碱法"],generalTerms:["纯碱"],refresh:"never"},cfg,{...s,expand,enableGeneral:true,dedupe:false});
 const relatedBlocks=r.files.flatMap(f=>f.blocks).filter(b=>(b.related||[]).includes("纯碱"));
 console.log("expand",expand,"files",r.totals.files,"generalBlocks",relatedBlocks.length,"sample",relatedBlocks[0]?.label);
}
