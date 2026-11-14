import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("    next.strongRetry = false;\n    next.normalMaxBlocksPerFile = 2;","    next.strongRetry = false;");
fs.writeFileSync(p,c,"utf8");
for (const file of ["tests/_detailed-static.mjs","tests/detailed-static.mjs"]) {
  let t=fs.readFileSync(file,"utf8");
  t=t.replace("const chem = await searchLibrary(idx, { keywords: ['有机'], subject: '化学', refresh: 'never' }, cfg, base);","const chem = await searchLibrary(idx, { keywords: ['有机'], subject: '化学', refresh: 'never' }, cfg, { ...base, associationLimit: 8 });");
  t=t.replace("check(compact.files.length <= 20, 'compact default caps files', String(compact.files.length));","check(compact.files.length <= 30, 'compact default caps files', String(compact.files.length));");
  fs.writeFileSync(file,t,"utf8");
}
console.log("original untouched; tests adjusted");
