import { apply } from "../lib/index.js";
const lib="D:/AI/work/kw-search-mode/fixtures/选题";
const tools=[]; const ctx={tools:{register:(d)=>{tools.push(d);return ()=>{};}},logger:()=>({info(){}})};
apply(ctx,{libraries:[lib],maxFiles:6,maxBlocksPerFile:2,snippetChars:60});
const t=tools.find(x=>x.name==="library_search");
const r=await t.execute({library:lib,keywords:["沉淀溶解平衡"],match:"any",refresh:"never"},{signal:new AbortController().signal});
const text=t.output.render({},r)[0].text;
console.log("files="+r.totals.files+" shown="+r.totals.shownFiles+" blocks="+r.totals.blocks+" chars="+text.length);
console.log(text.split("\n").slice(0,6).join("\n"));
