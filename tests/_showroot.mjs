import { loadSettings } from "../lib/settings-store.js";
const s=await loadSettings(); console.log(s.libraryRoot, s.cacheDir);
