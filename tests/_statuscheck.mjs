import { apply } from "../lib/index.js";
const lib="D:/AI/work/kw-search-mode/fixtures/选题";
const tools=[]; const ctx={tools:{register:(d)=>{tools.push(d);return ()=>{};}},logger:()=>({info(){}})};
apply(ctx,{libraries:[lib]});
const call=async(name,args)=>{const t=tools.find(x=>x.name===name); return t.execute(args,{signal:new AbortController().signal});};
const st=await call("library_status",{library:lib});
console.log("status:",JSON.stringify(st));
const r=await call("library_search",{library:lib,keywords:["沉淀溶解平衡"],match:"any",refresh:"never",maxFiles:2,maxBlocksPerFile:2});
console.log(r.files.map(f=>f.name+":"+f.blocks.map(b=>b.label).join(" | ")).join("\n"));
