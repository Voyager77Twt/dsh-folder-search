import fs from "node:fs";
import { apply as applyTools } from "../lib/index.js";
import { apply as applySettings } from "../lib/settings-host.js";
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary } from "../lib/search.js";

const tools=[]; const ctx={tools:{register:(d)=>{tools.push(d);return ()=>{};}},logger:()=>({info(){}})};
applyTools(ctx,{libraries:[]});
console.log("tools:",tools.map(t=>t.name).join(","));

const s0=await loadSettings();
console.log("defaults ok:",s0.normalMaxFiles,s0.normalSnippetChars,s0.expandSnippetChars,s0.expand);
const saved=await saveSettings({normalSnippetChars:77});
console.log("saved snippet:",saved.normalSnippetChars);
const restored=await saveSettings({normalSnippetChars:90});
console.log("restored snippet:",restored.normalSnippetChars);

// fake web server route
let handler=null;
applySettings({get:(n)=>n==='webServer'?{register:(r)=>{handler=r.handler;return ()=>{};}}:undefined,effect:(fn)=>fn()});
const res={writeHead:(code,headers)=>{res.code=code;res.headers=headers;},end:(body)=>{res.body=body;}};
await handler({method:'GET',headers:{host:'127.0.0.1:43129'}},res);
console.log("GET route:",res.code,JSON.parse(res.body).settings.normalSnippetChars);

// client registration mock
globalThis.window={__ModuleLoader__:{load:(spec)=>{const React={createElement:()=>({}),useState:()=>[null,()=>{}],useEffect:()=>{}}; const mod=spec.factory((name)=>React); const regs=[]; mod.apply({slots:{inject:(key,fn)=>{regs.push(key); fn();return ()=>{};},register:(entry)=>entry}}); console.log("client register:",regs.join(","));}}};
await import("../lib/client.js");
