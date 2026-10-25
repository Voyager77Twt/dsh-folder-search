import { apply } from "../lib/index.js";
const lib="D:/AI/work/kw-search-mode/fixtures/选题";
const tools=[]; const ctx={tools:{register:(d)=>{tools.push(d);return ()=>{};}},get:()=>null,effect:()=>()=>{},logger:()=>({info(){},warn(){}})};
apply(ctx,{libraries:[lib]});
const t=tools.find(x=>x.name==="library_search");
const r=await t.execute({keywords:["沉淀溶解平衡"],refresh:"never"},{signal:new AbortController().signal});
console.log("files",r.totals.files,"shown",r.totals.shownFiles,"truncated",r.truncated);
