import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary } from "../lib/search.js";
const st=await loadSettings();
const root="D:/AI/work/kw-search-mode/fixtures/选题";
const cfg={libraries:[root],rgPath:"D:/AI/deepseek-harness/DSH Desktop/resources/app.asar.unpacked/node_modules/@vscode/ripgrep-win32-x64/bin/rg.exe"};
const idx=indexFor(root,cfg);
for(const [label,args] of [["plain",{keywords:["侯氏制碱法"]}],["strong",{keywords:["侯氏制碱法"],strongTerms:["侯德榜"]}],["general",{keywords:["侯氏制碱法"],generalTerms:["纯碱"]}]]){
  const r=await searchLibrary(idx,{...args,refresh:"never"},cfg,st);
  console.log(label,"files",r.totals.files,"relatedOnly",r.files.filter(f=>f.relatedOnly).length);
}
