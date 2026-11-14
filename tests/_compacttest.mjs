import { loadSettings } from "../lib/settings-store.js"; import { indexFor } from "../lib/indexer.js"; import { searchLibrary, renderSearchResult } from "../lib/search.js";
const s=await loadSettings(); s.libraryRoot='D:/AI/work/kw-search-mode/fixtures/选题'; const cfg={libraries:[s.libraryRoot],associations:{}}; const idx=indexFor(s.libraryRoot,cfg);
for (const all of [false,true]) {
 const r=await searchLibrary(idx,{keywords:['侯氏制碱法'],strongTerms:['侯德榜'],refresh:'never',...(all?{all:true}:{})},cfg,{...s,searchMode:'default',dedupe:false});
 const maxBlocks=Math.max(...r.files.map(f=>f.blocks.length));
 const text=renderSearchResult(r);
 console.log({all,shown:r.totals.shownFiles,files:r.totals.files,direct:r.totals.directFiles,blocks:r.files.length?maxBlocks:0,summary:text.includes('未列出'),allHint:text.includes('全部列出')});
}
