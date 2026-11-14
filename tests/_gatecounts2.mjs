import { loadSettings } from "../lib/settings-store.js"; import { indexFor } from "../lib/indexer.js"; import { searchLibrary } from "../lib/search.js";
const s=await loadSettings(); const cfg={libraries:['D:/AI/work/kw-search-mode/fixtures/选题'],associations:{}}; const idx=indexFor('D:/AI/work/kw-search-mode/fixtures/选题',cfg);
for(const terms of [['侯德榜','纯碱','碳酸钠','索尔维'],['侯德榜','纯碱','索尔维','氨碱法'],['侯德榜','纯碱','碳酸钠','氯化铵']]){
 const r=await searchLibrary(idx,{keywords:['侯氏制碱法'],strongTerms:terms,refresh:'never'},cfg,{...s,strongLimit:2,strongGateMode:'files',strongGateFiles:10,dedupe:false,allowGeneralFiles:false});
 const counts={}; for(const f of r.files) for(const t of f.strongTerms) counts[t]=(counts[t]||0)+1; console.log(terms,counts,r.strongGate);
}
