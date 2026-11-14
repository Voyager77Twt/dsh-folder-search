import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary, renderSearchResult } from "../lib/search.js";
const s=await loadSettings(); const cfg={libraries:[s.libraryRoot],cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency,associations:{}}; const idx=indexFor(s.libraryRoot,cfg);
const r=await searchLibrary(idx,{keywords:["侯氏制碱法"],strongTerms:["侯德榜","联合制碱法"],generalTerms:["纯碱"],refresh:"never"},cfg,{...s,strongLimit:2,strongGateMode:"domain",strongGateSuffixes:["侯德榜"],allowGeneralFiles:false,dedupe:false});
console.log(JSON.stringify({gate:r.strongGate,strong:r.totals.relatedFiles,general:r.totals.generalFiles,shown:r.totals.shownFiles,overlap:r.files.filter(f=>f.generalOnly&&f.relatedOnly).length}));
console.log(renderSearchResult(r).split("\n").slice(2,7).join("\n"));
