import { saveSettings, loadSettings } from "../lib/settings-store.js";
await saveSettings({ expandMaxFiles: 5000 });
const s=await loadSettings(); console.log("setting", s.expandMaxFiles);
