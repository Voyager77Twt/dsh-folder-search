import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary } from "../lib/search.js";
const st={...(await loadSettings()), normalMaxFiles:"all", expandMaxFiles:2};
const root="D:/AI/work/kw-search-mode/fixtures/选题";
const cfg={libraries:[root],rgPath:"D:/AI/deepseek-harness/DSH Desktop/resources/app.asar.unpacked/node_modules/@vscode/ripgrep-win32-x64/bin/rg.exe",associations:{}};
const idx=indexFor(root,cfg);
const r=await searchLibrary(idx,{keywords:["侯氏制碱法"],strongTerms:["侯德榜"],refresh:"never"},cfg,st);
console.log("files",r.totals.files,"shown",r.totals.shownFiles,"direct",r.files.filter(f=>!f.relatedOnly).length,"related",r.files.filter(f=>f.relatedOnly).length,"trunc",r.truncated);
