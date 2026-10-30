import { saveSettings, loadSettings } from "../lib/settings-store.js";
await saveSettings({ strongLimit: 2 });
console.log("strongLimit", (await loadSettings()).strongLimit);
