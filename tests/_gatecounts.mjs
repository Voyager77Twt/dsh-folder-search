import { loadSettings } from "../lib/settings-store.js"; import { indexFor } from "../lib/indexer.js"; import { searchLibrary } from "../lib/search.js";
const s=await loadSettings(); s.libraryRoot='D:/AI/work/kw-search-mode/fixtures/选题'; const cfg={libraries:[s.libraryRoot],associations:{}}; const idx=indexFor(s.libraryRoot,cfg);
const r=await searchLibrary(idx,{keywords:['侯氏制碱法'],strongTerms:['侯德榜','纯碱','碳酸钠'],generalTerms:['联合制碱'],refresh:'never'},cfg,{...s,strongLimit:2,strongGateMode:'domain',strongGateSuffixes:['题目','试题'],dedupe:false,allowGeneralFiles:false});
const counts={}; for(const f of r.files) for(const t of f.strongTerms) counts[t]=(counts[t]||0)+1; console.log(counts, r.strongGate, r.totals);
