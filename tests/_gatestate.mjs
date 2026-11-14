import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary } from "../lib/search.js";
const s=await loadSettings();
const cfg={libraries:[s.libraryRoot],cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency,associations:{}};
const idx=indexFor(s.libraryRoot,cfg);
for (const allow of [false,true]) {
 const r=await searchLibrary(idx,{keywords:["侯氏制碱法"],strongTerms:["侯德榜","联合制碱法"],generalTerms:["纯碱","碳酸钠"],refresh:"never"},cfg,{...s,strongLimit:2,strongGateSuffixes:["题目","试题","领域","行业","产业"],allowGeneralFiles:allow,dedupe:false});
 const overlap=r.files.filter(f=>f.generalOnly&&f.relatedOnly).length;
 const generalFiles=r.files.filter(f=>f.generalOnly).length;
 console.log(JSON.stringify({allow,direct:r.totals.directFiles,strong:r.totals.relatedFiles,general:r.totals.generalFiles,generalFiles,shown:r.totals.shownFiles,gate:r.strongGate,overlap,trunc:r.truncated}));
}
