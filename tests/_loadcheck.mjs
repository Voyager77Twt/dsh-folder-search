import fs from "node:fs";
import { load } from "js-yaml";
const doc=load(fs.readFileSync("cordis.patch.yml","utf8"));
const preset=doc[0].insert[0];
console.log("yaml ok, preset id",preset.config.id,"plugins",preset.config.plugins.length);
const { apply } = await import("../lib/index.js").catch(e=>{console.log("IMPORT ERR",e);return {}});
if(apply){ const tools=[]; apply({tools:{register:(d)=>{tools.push(d);return ()=>{};}},logger:()=>({info(){}})},{libraries:[]}); console.log("tools:",tools.map(t=>t.name).join(", ")); }
