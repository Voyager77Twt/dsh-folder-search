import { indexFor } from "../lib/indexer.js";
import { searchLibrary, renderSearchResult } from "../lib/search.js";
import { outlineLibrary } from "../lib/outline.js";
import { humanBytes } from "../lib/util.js";
const root="D:/AI/work/kw-search-mode/fixtures/选题";
const cfg={libraries:[root],rgPath:"D:/AI/deepseek-harness/DSH Desktop/resources/app.asar.unpacked/node_modules/@vscode/ripgrep-win32-x64/bin/rg.exe",maxFiles:4,maxBlocksPerFile:2};
const idx=indexFor(root,cfg);
const st=await idx.stats();
console.log("STATS",JSON.stringify({docs:st.documents,ready:st.ready,failed:st.failed,cache:humanBytes(st.cacheBytes)}));
for(const [kw,match] of [["沉淀溶解平衡","any"],["同分异构","any"],["有机","all"]]){
  const t=Date.now();
  const r=await searchLibrary(idx,{keywords:[kw],match,refresh:"never",maxFiles:3,maxBlocksPerFile:2},cfg);
  console.log("\n### "+kw+"  "+ (Date.now()-t)+"ms  files="+r.totals.files+" blocks="+r.totals.blocks);
  console.log(renderSearchResult(r).split("\n").slice(0,10).join("\n"));
}
const o=await outlineLibrary(idx,{refresh:"never",maxFiles:3});
console.log("\n### OUTLINE\n"+o.text.split("\n").slice(0,10).join("\n"));
