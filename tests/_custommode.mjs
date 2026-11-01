import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary } from "../lib/search.js";
const s=await loadSettings();
const cfg={libraries:[s.libraryRoot],cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency,associations:{}};
const idx=indexFor(s.libraryRoot,cfg);
for(const mode of ["default","full","original"]){
 const r=await searchLibrary(idx,{keywords:["沉淀溶解平衡"],refresh:"never"},cfg,{...s,searchMode:mode,expand:true,associationLimit:4,customAssociations:{沉淀溶解平衡:["Ksp"]},dedupe:false});
 console.log(mode,JSON.stringify(r.query.expanded),r.totals.directFiles,r.totals.expandedFiles);
}
