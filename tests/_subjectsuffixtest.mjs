import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary } from "../lib/search.js";
const s=await loadSettings(); const cfg={libraries:[s.libraryRoot],cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency,associations:{}}; const idx=indexFor(s.libraryRoot,cfg);
for (const subject of [null,'化学']) {
 const args={keywords:['侯氏制碱法'],strongTerms:['化学实验'],refresh:'never',...(subject?{subject}:{})};
 const r=await searchLibrary(idx,args,cfg,{...s,strongLimit:2,strongGateMode:'domain',dedupe:false,allowGeneralFiles:false});
 console.log(subject||'none',JSON.stringify(r.strongGate),r.query.expanded['侯氏制碱法']);
}
