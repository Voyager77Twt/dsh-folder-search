import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary } from "../lib/search.js";
const base=await loadSettings();
const root="D:/AI/work/kw-search-mode/fixtures/选题";
const cfg={libraries:[root],rgPath:"D:/AI/deepseek-harness/DSH Desktop/resources/app.asar.unpacked/node_modules/@vscode/ripgrep-win32-x64/bin/rg.exe",associations:{}};
const idx=indexFor(root,cfg);
for(const disabled of [[],["沉淀溶解平衡"]]){
 const st={...base,customAssociations:{沉淀溶解平衡:["溶度积","Ksp"]},customDisabled:disabled,dedupe:false};
 const r=await searchLibrary(idx,{keywords:["沉淀溶解平衡"],refresh:"never"},cfg,st);
 console.log("disabled",JSON.stringify(disabled),"expanded",JSON.stringify(r.query.expanded));
}
