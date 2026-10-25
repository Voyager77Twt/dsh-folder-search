import fs from "node:fs";
import { DEFAULT_SETTINGS } from "../lib/settings-store.js";
const search=fs.readFileSync("lib/search.js","utf8")+fs.readFileSync("lib/outline.js","utf8");
const client=fs.readFileSync("lib/client.js","utf8");
for(const key of Object.keys(DEFAULT_SETTINGS)){
  const inSearch=search.includes("settings."+key)||search.includes("settings?."+key);
  const inClient=client.includes(key);
  if(!inSearch||!inClient) console.log(key,"search",inSearch,"client",inClient);
}
console.log("checked",Object.keys(DEFAULT_SETTINGS).length,"settings");
