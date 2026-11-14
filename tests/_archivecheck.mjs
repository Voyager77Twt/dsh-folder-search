import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { zipSync } from 'fflate';
import { extractFile } from '../lib/extract.js';
const root='D:/AI/work/kw-search-mode';
const doc=path.join(root,'fixtures/选题/模拟试题/2025届高三资料/2025二模原题分类汇编/2025二模分类汇编——原理大题.docx');
const docBuf=fs.readFileSync(doc);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'zip-index-test-'));
const zipPath=path.join(tmp,'archive.zip');
const nested=zipSync({'inner.docx':docBuf});
fs.writeFileSync(zipPath, Buffer.from(zipSync({
  'folder/a.docx':docBuf,
  '../evil.docx':docBuf,
  'nested.zip':nested,
  'note.txt':new TextEncoder().encode('辛亥革命 武昌起义')
})));
try {
 const r=await extractFile(zipPath,'.zip',{maxFileMB:200,security:{zipMaxEntries:100,zipMaxEntryMB:64,zipMaxTotalMB:50,zipMaxRatio:1000,archiveMaxDepth:2,archiveTreeMaxEntries:100,archiveTreeMaxMB:100,archiveMaxDepth:2}});
 console.log('blocks',r.blocks.length,'chars',r.chars,'members',[...new Set(r.blocks.map(b=>b.loc.member))]);
 console.log('first',r.blocks[0]?.loc, r.blocks[0]?.text.slice(0,30));
} catch(e){ console.error('ERR',e.message); }
fs.rmSync(tmp,{recursive:true,force:true});
