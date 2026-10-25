import { indexFor } from "../lib/indexer.js";
import { searchLibrary, renderSearchResult } from "../lib/search.js";
const root="D:/AI/work/kw-search-mode/fixtures/选题";
const cfg={libraries:[root],rgPath:"D:/AI/deepseek-harness/DSH Desktop/resources/app.asar.unpacked/node_modules/@vscode/ripgrep-win32-x64/bin/rg.exe"};
const idx=indexFor(root,cfg);
for(const kw of ["沉淀溶解平衡","同分异构"]){
  const r=await searchLibrary(idx,{keywords:[kw],match:"any",refresh:"never"},cfg);
  const text=renderSearchResult(r);
  console.log("### "+kw+" files="+r.totals.files+" shown="+r.totals.shownFiles+" blocks="+r.totals.blocks+" chars="+text.length);
  console.log(text.split("\n").slice(0,9).join("\n"));
}
