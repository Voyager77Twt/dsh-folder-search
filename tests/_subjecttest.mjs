import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary } from "../lib/search.js";
const s=await loadSettings(); const cfg={libraries:[s.libraryRoot],cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency,associations:{}}; const idx=indexFor(s.libraryRoot,cfg);
for (const [subject,expand] of [[null,true],['化学',true],['化学',false],['历史',true]]) {
 const r=await searchLibrary(idx,{keywords:['有机'],...(subject?{subject}:{}),refresh:'never'},cfg,{...s,expand,dedupe:false});
 console.log(subject||'none',expand,r.query.subject,JSON.stringify(r.query.expanded['有机']));
}
const g=await searchLibrary(idx,{keywords:['原因'],refresh:'never'},cfg,{...s,expand:false,dedupe:false});
console.log('general',JSON.stringify(g.query.expanded['原因']));
