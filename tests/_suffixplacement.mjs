import { loadSettings } from "../lib/settings-store.js";
const base=await loadSettings();
let factory=null; globalThis.window={__ModuleLoader__:{load(spec){factory=spec.factory;}}}; let registered=null;
const React={createElement(type,props,...children){return {type,props:props||{},children};},useState(initial){const values=[base,null,'',false,'',null,false,'',''];const i=(React._h=(React._h??-1)+1);return [values[i]??initial,()=>{}];},useEffect(){},useCallback(fn){return fn;},useMemo(fn){return fn();},Fragment:'F'};
await import('../lib/client.js'); const mod=factory((n)=>n==='react'?React:null);
const ctx={get(){return null;},slots:{inject(n,f){f();},register(d,c){registered={d,c};}}}; mod.apply(ctx);
for(const mode of ['default','full','custom','original']){
 base.searchMode=mode; React._h=-1; const tree=registered.c();
 const strings=[]; const walk=(n)=>{if(typeof n==='string')strings.push(n);else if(Array.isArray(n))n.forEach(walk);else if(n&&n.children)n.children.forEach(walk);}; walk(tree);
 console.log(mode,strings.filter(s=>s==='强关联领域词后缀').length);
}
