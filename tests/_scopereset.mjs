import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
const old=`                const raw = e.target.value;
                setLibraryText(raw);
                const roots = raw.split(/[,，\\n]/).map((item) => item.trim()).filter(Boolean);
                update({ libraryRoots: roots, libraryRoot: roots[0] || '' });`;
const neu=`                const raw = e.target.value;
                setLibraryText(raw);
                const roots = raw.split(/[,，\\n]/).map((item) => item.trim()).filter(Boolean);
                const previousMultiple = (settings.libraryRoots?.length || 0) > 1;
                const scopePatch = roots.length > 1 && !previousMultiple && settings.librarySearchScope === 'ask'
                  ? { librarySearchScope: 'all' }
                  : {};
                update({ libraryRoots: roots, libraryRoot: roots[0] || '', ...scopePatch });`;
if(!c.includes(old)) throw new Error('textarea scope marker'); c=c.replace(old,neu);
fs.writeFileSync(p,c,"utf8");
console.log("scope reset on first second library");
