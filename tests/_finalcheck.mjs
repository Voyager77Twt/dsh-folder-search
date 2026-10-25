import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary } from "../lib/search.js";
const base=await loadSettings();
const root="D:/AI/work/kw-search-mode/fixtures/选题";
const cfg={libraries:[root],rgPath:"D:/AI/deepseek-harness/DSH Desktop/resources/app.asar.unpacked/node_modules/@vscode/ripgrep-win32-x64/bin/rg.exe",associations:{沉淀溶解平衡:["溶度积","Ksp","难溶电解质","沉淀转化"]}};
const idx=indexFor(root,cfg);
for(const finalMax of ["all",75,10]){
 const st={...base,dedupe:false,finalMaxFiles:finalMax};
 const r=await searchLibrary(idx,{keywords:["沉淀溶解平衡"],refresh:"never"},cfg,st);
 console.log("final",finalMax,"shown",r.totals.shownFiles,"direct",r.files.filter(f=>f.directKeywords?.length).length,"expanded",r.files.filter(f=>f.expandedOnly).length,"strong",r.files.filter(f=>f.relatedOnly).length,"trunc",r.truncated);
}
