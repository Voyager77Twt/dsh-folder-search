import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary, renderSearchResult } from "../lib/search.js";
const s=await loadSettings();
const cfg={libraries:[s.libraryRoot],cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency,associations:{}};
const idx=indexFor(s.libraryRoot,cfg);
const r=await searchLibrary(idx,{keywords:["侯氏制碱法"],strongTerms:["联合制碱法","侯德榜"],generalTerms:["纯碱","碳酸钠","侯德榜","索尔维","氨碱法","氯化铵"],refresh:"never"},cfg,{...s,allowGeneralFiles:false,dedupe:false});
console.log(JSON.stringify({direct:r.totals.directFiles,general:r.totals.generalFiles,shown:r.totals.shownFiles,trunc:r.truncated,fallback:r.totals.fallback}));
console.log(renderSearchResult(r).split("\n").slice(2,7).join("\n"));
