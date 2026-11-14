import { loadSettings } from "../lib/settings-store.js"; import { indexFor } from "../lib/indexer.js"; import { searchLibrary, renderSearchResult } from "../lib/search.js";
const s=await loadSettings(); s.libraryRoot='D:/AI/work/kw-search-mode/fixtures/选题'; const cfg={libraries:[s.libraryRoot],associations:{}}; const idx=indexFor(s.libraryRoot,cfg);
const r=await searchLibrary(idx,{keywords:['侯氏制碱法'],strongTerms:['侯德榜'],refresh:'never'},cfg,{...s,searchMode:'default',dedupe:false});
console.log('trunc',r.truncated,'shown',r.totals.shownFiles,'files',r.totals.files,'listAll',r.listAll);
console.log(renderSearchResult(r).split('\n').slice(-8).join('\n'));
