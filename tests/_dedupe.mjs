import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary } from "../lib/search.js";
const st=await loadSettings();
const root="D:/AI/work/kw-search-mode/fixtures/选题";
const cfg={libraries:[root],rgPath:"D:/AI/deepseek-harness/DSH Desktop/resources/app.asar.unpacked/node_modules/@vscode/ripgrep-win32-x64/bin/rg.exe",associations:{}};
const idx=indexFor(root,cfg);
const r=await searchLibrary(idx,{keywords:["侯氏制碱法","侯德榜","纯碱"],strongTerms:["侯德榜"],refresh:"never"},cfg,st);
console.log("keywords",JSON.stringify(r.query.keywords),"files",r.totals.files,"gate",JSON.stringify(r.strongGate));
