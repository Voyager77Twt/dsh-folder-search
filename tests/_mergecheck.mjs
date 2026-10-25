import { loadSettings } from "../lib/settings-store.js";
const s=await loadSettings();
console.log("keys",Object.keys(s).join(","));
console.log("associationLimit",s.associationLimit,"strongLimit",s.strongLimit,"generalLimit",s.generalLimit);
