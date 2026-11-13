import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { zipSync, strToU8 } from "fflate";
import { extractFile } from "../lib/extract.js";
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"zipsec-"));
const p=path.join(dir,"bomb.docx");
fs.writeFileSync(p, Buffer.from(zipSync({"word/document.xml": new Uint8Array(2*1024*1024)})));
try { await extractFile(p,".docx",{maxFileMB:200,security:{zipMaxEntries:5000,zipMaxEntryMB:1,zipMaxTotalMB:8,zipMaxRatio:1000}}); console.log("FAIL: bomb accepted"); }
catch(error){ console.log("PASS bomb blocked:", error.message); }
fs.rmSync(dir,{recursive:true,force:true});
