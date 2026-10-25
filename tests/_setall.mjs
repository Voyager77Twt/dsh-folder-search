import { saveSettings, loadSettings } from "../lib/settings-store.js";
const before=await loadSettings();
console.log("before", before.expandMaxFiles);
await saveSettings({ expandMaxFiles: "all" });
const after=await loadSettings();
console.log("after", after.expandMaxFiles);
