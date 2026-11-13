import { loadSettings, saveSettings } from "../lib/settings-store.js";
import { indexFor } from "../lib/indexer.js";
const before=await loadSettings();
await saveSettings(before);
const s=await loadSettings();
const idx=indexFor(s.libraryRoot,{cacheDir:s.cacheDir||undefined,maxFileMB:s.maxFileMB,parseIsolation:s.parseIsolation,parseWorkerMB:s.parseWorkerMB,security:{zipMaxEntries:s.zipMaxEntries,zipMaxEntryMB:s.zipMaxEntryMB,zipMaxTotalMB:s.zipMaxTotalMB,zipMaxRatio:s.zipMaxRatio,maxTextMB:s.maxTextMB}});
const st=await idx.stats();
console.log(JSON.stringify({version:"0.5.40",libraryRoot:s.libraryRoot,cacheDir:s.cacheDir||"default",cache:idx.cacheDir,documents:st.documents,ready:st.ready,failed:st.failed,parseIsolation:s.parseIsolation,zipMaxEntries:s.zipMaxEntries,officeAllowMacros:s.officeAllowMacros}));
