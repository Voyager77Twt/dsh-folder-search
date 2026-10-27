import { saveSettings, loadSettings } from "../lib/settings-store.js";
const before=await loadSettings();
console.log("before",before.libraryRoot);
await saveSettings({ libraryRoot: "D:\\AI\\work\\kw-search-mode\\fixtures\\选题" });
const after=await loadSettings();
console.log("after",after.libraryRoot);
