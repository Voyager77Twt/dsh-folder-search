import fs from "node:fs";
const t=fs.readFileSync("lib/settings-store.js","utf8");
const block=t.match(/export const DEFAULT_SETTINGS = \{([\s\S]*?)\n\};/)[1];
const keys=[...block.matchAll(/^\s{2}([A-Za-z0-9_]+):/gm)].map(m=>m[1]);
console.log(keys.length, keys.slice(-12).join(","));
