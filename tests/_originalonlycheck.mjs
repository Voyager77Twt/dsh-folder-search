import { loadSettings } from "../lib/settings-store.js"; import { indexFor } from "../lib/indexer.js"; import { searchLibrary } from "../lib/search.js";
const s=await loadSettings(); const cfg={libraries:['D:/AI/work/kw-search-mode/fixtures/选题'],associations:{}}; const idx=indexFor('D:/AI/work/kw-search-mode/fixtures/选题',cfg);
const r=await searchLibrary(idx,{keywords:['有机'],subject:'化学',strongTerms:['侯德榜'],generalTerms:['纯碱'],refresh:'never'},cfg,{...s,searchMode:'original',dedupe:false});
console.log(JSON.stringify({expanded:r.query.expanded['有机'],strong:r.totals.relatedFiles,general:r.totals.generalFiles,direct:r.totals.directFiles}));
