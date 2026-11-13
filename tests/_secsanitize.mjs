import { sanitizeSettings } from "../lib/settings-store.js";
const s=sanitizeSettings({zipMaxEntries:999999,zipMaxEntryMB:0,zipMaxTotalMB:99999,zipMaxRatio:1,maxTextMB:999,parseIsolation:false,parseWorkerMB:9999,officeAllowMacros:true});
console.log(JSON.stringify({zipMaxEntries:s.zipMaxEntries,zipMaxEntryMB:s.zipMaxEntryMB,zipMaxTotalMB:s.zipMaxTotalMB,zipMaxRatio:s.zipMaxRatio,maxTextMB:s.maxTextMB,parseIsolation:s.parseIsolation,parseWorkerMB:s.parseWorkerMB,officeAllowMacros:s.officeAllowMacros}));
