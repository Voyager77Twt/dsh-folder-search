import { loadSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
const s=await loadSettings(); const i=indexFor(s.libraryRoot,{cacheDir:s.cacheDir||undefined,indexConcurrency:s.indexConcurrency}); const m=await i.loadManifest(); const es=Object.entries(m.files||{});
const failed=es.filter(([,e])=>e.err); const ready=es.filter(([,e])=>!e.err);
const byExt={}; for(const [rel,e] of es){const ext=rel.split('.').pop().toLowerCase(); byExt[ext]=byExt[ext]||{n:0,failed:0,chars:0};byExt[ext].n++;if(e.err)byExt[ext].failed++;else byExt[ext].chars+=e.chars||0;}
console.log("entries",es.length,"ready",ready.length,"failed",failed.length);
console.log("byExt",JSON.stringify(byExt));
const reasons={}; for(const [,e] of failed){const r=e.err||'?';reasons[r]=(reasons[r]||0)+1;} console.log("reasons",JSON.stringify(reasons).slice(0,1000));
