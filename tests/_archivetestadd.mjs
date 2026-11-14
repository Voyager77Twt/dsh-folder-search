import fs from "node:fs";
let p="tests/_detailed-static.mjs"; let c=fs.readFileSync(p,"utf8");
c=c.replace("check(keys.length === 45, '45 settings keys', String(keys.length));","check(keys.length === 48, '48 settings keys', String(keys.length));");
c=c.replace("check(pkg.version === '0.5.52', 'package version 0.5.52', pkg.version);","check(pkg.version === '0.5.53', 'package version 0.5.53', pkg.version);");
const marker="// 9. Office/security scripts and worker wiring";
const add=`// 8b. ZIP archive member indexing
const archiveDir = fs.mkdtempSync(path.join(os.tmpdir(), 'folder-search-archive-test-'));
try {
  const fixtureDocx = path.join(library, '模拟试题', '2025届高三资料', '2025二模原题分类汇编', '2025二模分类汇编——原理大题.docx');
  if (fs.existsSync(fixtureDocx)) {
    const docBuf = fs.readFileSync(fixtureDocx);
    const archivePath = path.join(archiveDir, 'archive.zip');
    fs.writeFileSync(archivePath, Buffer.from(zipSync({
      'folder/a.docx': docBuf,
      '../evil.txt': strToU8('辛亥革命 武昌起义'),
      'note.txt': strToU8('光合作用 卡尔文循环'),
    })));
    const beforeTemps = new Set(fs.readdirSync(os.tmpdir()).filter((name) => name.startsWith('dsh-folder-search-archive-')));
    const archive = await extractFile(archivePath, '.zip', { maxFileMB: 200, security: { archiveMaxDepth: 2, archiveTreeMaxEntries: 100, archiveTreeMaxMB: 100 } });
    check(archive.blocks.length > 0, 'zip member text is indexed');
    check(archive.blocks.some((block) => block.loc.member === 'folder/a.docx'), 'zip member label retained');
    check(archive.blocks.some((block) => block.loc.member === 'evil.txt'), 'zip-slip member label is sanitized');
    check(!archive.blocks.some((block) => String(block.loc.member).includes('..')), 'zip member labels do not expose traversal');
    const afterTemps = fs.readdirSync(os.tmpdir()).filter((name) => name.startsWith('dsh-folder-search-archive-'));
    check(afterTemps.every((name) => beforeTemps.has(name)), 'zip temp directories are cleaned');
    const nestedPath = path.join(archiveDir, 'nested.zip');
    fs.writeFileSync(nestedPath, Buffer.from(zipSync({ 'inner.docx': docBuf })));
    const outerPath = path.join(archiveDir, 'outer.zip');
    fs.writeFileSync(outerPath, Buffer.from(zipSync({ 'nested.zip': fs.readFileSync(nestedPath) })));
    const shallow = await extractFile(outerPath, '.zip', { maxFileMB: 200, security: { archiveMaxDepth: 1, archiveTreeMaxEntries: 100, archiveTreeMaxMB: 100 } });
    check(!shallow.blocks.some((block) => String(block.loc.member).includes('inner.docx')), 'archive max depth stops nested extraction');
  } else {
    check(false, 'archive fixture docx exists');
  }
} finally {
  fs.rmSync(archiveDir, { recursive: true, force: true });
}

// 9. Office/security scripts and worker wiring`;
if(!c.includes(marker)) throw new Error('archive test marker'); c=c.replace(marker,add);
fs.writeFileSync(p,c,"utf8");
fs.copyFileSync(p,"tests/detailed-static.mjs");
console.log("archive tests added");
