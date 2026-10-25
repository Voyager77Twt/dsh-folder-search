import { loadSettings } from "../lib/settings-store.js";
const s=await loadSettings(); console.log("toggles",s.enableStrong,s.enableGeneral,"limits",s.strongLimit,s.associationLimit);
