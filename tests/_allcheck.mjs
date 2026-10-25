import { apply } from "../lib/index.js";
const lib="D:/AI/work/kw-search-mode/fixtures/选题";
const tools=[]; const ctx={tools:{register:(d)=>{tools.push(d);return ()=>{};}},logger:()=>({info(){}})};
apply(ctx,{libraries:[lib]});
const t=tools.find(x=>x.name==="library_search");
for(const kw of ["Ksp","沉淀溶解平衡"]){
  const r=await t.execute({library:lib,keywords:[kw],refresh:"never"},{signal:new AbortController().signal});
  const text=t.output.render({},r)[0].text;
  console.log(kw,"files="+r.totals.files,"shown="+r.totals.shownFiles,"chars="+text.length);
}
