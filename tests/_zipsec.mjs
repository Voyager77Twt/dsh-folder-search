import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { zipSync, strToU8 } from "fflate";
import { extractFile } from "../lib/extract.js";
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"zipsec-"));
const p=path.join(dir,"bomb.docx");
const big=new Uint8Array(2*1024*1024); // 2 MB zeros
fs.writeFileSync(p, Buffer.from(zipSync({"word/document.xml": big})));
try { await extractFile(p,".docx",{maxFileMB:200,security:{zipMaxEntries:5000,zipMaxEntryMB:64,zipMaxTotalMB:1,zipMaxRatio:1000}}); console.log("FAIL: bomb accepted"); }
catch(error){ console.log("PASS bomb blocked:", error.message); }
const d=path.join(dir,"dtd.docx");
fs.writeFileSync(d, Buffer.from(zipSync({"word/document.xml": strToU8('<!DOCTYPE x [<!ENTITY e "x">]><w:document/>')})));
try { await extractFile(d,".docx",{maxFileMB:200,security:{}}); console.log("FAIL: dtd accepted"); }
catch(error){ console.log("PASS dtd blocked:", error.message); }
fs.rmSync(dir,{recursive:true,force:true});
