import { apply } from "../lib/index.js";
const lib="D:/AI/work/kw-search-mode/fixtures/选题";
const tools=[]; const ctx={tools:{register:(d)=>{tools.push(d);return ()=>{};}},get:()=>null,effect:()=>()=>{},logger:()=>({info(){},warn(){}})};
apply(ctx,{libraries:[lib]});
const t=tools.find(x=>x.name==="library_search");
for(const [label,strong] of [["broad",["纯碱工业"]],["narrow",["侯德榜"]],["two",["侯德榜","纯碱工业"]]]){
  const r=await t.execute({keywords:["侯氏制碱法"],strongTerms:strong,refresh:"never"},{signal:new AbortController().signal});
  console.log(label,"files",r.totals.files,"shown",r.totals.shownFiles,"gate",JSON.stringify(r.strongGate));
}
