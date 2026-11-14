import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
const start=c.indexOf("  if (mode === 'original') {");
const end=c.indexOf("  return next;\n}", start);
if(start<0||end<0) throw new Error('mode block markers');
const block=`  if (mode === 'original') {
    next.expand = false;
    next.enableStrong = false;
    next.enableGeneral = false;
    next.allowGeneralFiles = false;
    next.strongRetry = false;
    next.finalMaxFiles = 30;
  } else if (mode === 'default') {
    next.finalMaxFiles = 30;
  } else if (mode === 'full') {
    next.expand = true;
    next.enableStrong = true;
    next.enableGeneral = true;
    next.allowGeneralFiles = true;
    next.strongRetry = true;
    next.strongLimit = Math.max(Number(next.strongLimit ?? 2), 4);
    next.associationLimit = Math.max(Number(next.associationLimit ?? 2), 8);
    next.generalLimit = 8;
    next.normalMaxFiles = 'all';
    next.expandMaxFiles = 'all';
    next.strongMaxFiles = 'all';
    next.finalMaxFiles = 'all';
  }
`;
c=c.slice(0,start)+block+c.slice(end);
fs.writeFileSync(p,c,"utf8");
console.log("full mode overrides");
