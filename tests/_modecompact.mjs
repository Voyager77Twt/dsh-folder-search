import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
const old=`  if (mode === 'original') {
    next.expand = false;
    next.enableStrong = false;
    next.enableGeneral = false;
    next.allowGeneralFiles = false;
    next.strongRetry = false;
  } else if (mode === 'full') {
    next.expand = true;
    next.enableStrong = true;
    next.enableGeneral = true;
    next.allowGeneralFiles = true;
    next.strongRetry = true;
    next.strongLimit = Math.max(Number(next.strongLimit ?? 2), 4);
    next.associationLimit = Math.max(Number(next.associationLimit ?? 4), 8);
    next.generalLimit = 8;
    next.normalMaxFiles = 'all';
    next.expandMaxFiles = 'all';
    next.strongMaxFiles = 'all';
    next.finalMaxFiles = 'all';
  }`;
const neu=`  if (mode === 'original') {
    next.expand = false;
    next.enableStrong = false;
    next.enableGeneral = false;
    next.allowGeneralFiles = false;
    next.strongRetry = false;
    next.normalMaxFiles = 12;
    next.normalMaxBlocksPerFile = 2;
    next.finalMaxFiles = 20;
  } else if (mode === 'default') {
    next.normalMaxFiles = 12;
    next.normalMaxBlocksPerFile = 2;
    next.expandMaxFiles = 6;
    next.expandMaxBlocksPerFile = 2;
    next.strongMaxFiles = 6;
    next.strongMaxBlocksPerFile = 2;
    next.finalMaxFiles = 20;
  } else if (mode === 'full') {
    next.expand = true;
    next.enableStrong = true;
    next.enableGeneral = true;
    next.allowGeneralFiles = true;
    next.strongRetry = true;
    next.strongLimit = Math.max(Number(next.strongLimit ?? 2), 4);
    next.associationLimit = Math.max(Number(next.associationLimit ?? 4), 8);
    next.generalLimit = 8;
    next.normalMaxFiles = 20;
    next.normalMaxBlocksPerFile = 2;
    next.expandMaxFiles = 10;
    next.expandMaxBlocksPerFile = 2;
    next.strongMaxFiles = 10;
    next.strongMaxBlocksPerFile = 2;
    next.finalMaxFiles = 30;
  }`;
if(!c.includes(old)) throw new Error('mode override marker'); c=c.replace(old,neu);
fs.writeFileSync(p,c,"utf8");
console.log("mode compact defaults");
