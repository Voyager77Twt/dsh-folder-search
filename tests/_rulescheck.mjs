import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary } from "../lib/search.js";
const base=await loadSettings();
const root="D:/AI/work/kw-search-mode/fixtures/选题";
const cfg={libraries:[root],rgPath:"D:/AI/deepseek-harness/DSH Desktop/resources/app.asar.unpacked/node_modules/@vscode/ripgrep-win32-x64/bin/rg.exe",associations:{}};
const idx=indexFor(root,cfg);
for(const [label,settings,strong] of [
 ["proper",{...base,strongLimit:2},["侯德榜"]],
 ["domain",{...base,strongLimit:2},["纯碱工业"]],
 ["retry",{...base,strongLimit:2,strongRetry:true,strongRetryMax:1},["侯德榜","纯碱工业"]]
]){
  const r=await searchLibrary(idx,{keywords:["侯氏制碱法"],strongTerms:strong,refresh:"never"},cfg,settings);
  console.log(label,"files",r.totals.files,"gate",JSON.stringify(r.strongGate));
}
