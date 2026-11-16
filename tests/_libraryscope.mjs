import fs from "node:fs";
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  libraryRoots: [],","  libraryRoots: [],\n  librarySearchScope: 'all',");
const marker="  base.libraryRoot = base.libraryRoots[0] || '';";
const add="  base.librarySearchScope = source.librarySearchScope === 'ask' ? 'ask' : 'all';\n  base.libraryRoot = base.libraryRoots[0] || '';";
if(!c.includes(marker)) throw new Error('library roots sanitize marker');
c=c.replace(marker,add);
fs.writeFileSync(p,c,"utf8");
console.log("librarySearchScope setting");
