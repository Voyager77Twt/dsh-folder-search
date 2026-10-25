import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary, renderSearchResult } from "../lib/search.js";
const base=await loadSettings();
const root="D:/AI/work/kw-search-mode/fixtures/选题";
const cfg={libraries:[root],rgPath:"D:/AI/deepseek-harness/DSH Desktop/resources/app.asar.unpacked/node_modules/@vscode/ripgrep-win32-x64/bin/rg.exe",associations:{沉淀溶解平衡:["溶度积","Ksp","难溶电解质","沉淀转化"]}};
const idx=indexFor(root,cfg);
for(const dedupe of [true,false]){
  const st={...base,dedupe};
  const r=await searchLibrary(idx,{keywords:["侯氏制碱法"],strongTerms:["侯德榜"],generalTerms:["联合制碱","索尔维","碳酸钠"],refresh:"never"},cfg,st);
  console.log("dedupe",dedupe,"direct",r.totals.directFiles,"expanded",r.totals.expandedFiles,"strong",r.totals.relatedFiles,"shown",r.totals.shownFiles,"directBlocks",r.totals.directBlocks,"expandedBlocks",r.totals.expandedBlocks,"strongBlocks",r.totals.relatedBlocks);
}
const r2=await searchLibrary(idx,{keywords:["沉淀溶解平衡"],refresh:"never"},cfg,{...base,dedupe:false});
console.log("organic direct",r2.totals.directFiles,"expanded",r2.totals.expandedFiles,"strong",r2.totals.relatedFiles,"expandedBlocks",r2.totals.expandedBlocks);
console.log(renderSearchResult(r2).split("\n").slice(2,7).join("\n"));
