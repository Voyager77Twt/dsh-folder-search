import fs from "node:fs";
const p="lib/extract.js";
let c=fs.readFileSync(p,"utf8");
c=c.replace("import JSZip from 'jszip';","import { unzipSync, strFromU8 } from 'fflate';");
c=c.replace("const MAX_BLOCKS = 200000;","const MAX_BLOCKS = 200000;\n\nfunction openZip(buf) {\n  const files = unzipSync(new Uint8Array(buf));\n  return {\n    names: () => Object.keys(files),\n    text: (name) => (files[name] ? strFromU8(files[name]) : null),\n  };\n}");
c=c.replace(`async function extractDocx(buf) {
  const zip = await JSZip.loadAsync(buf);
  const documentFile = zip.file('word/document.xml');
  if (!documentFile) throw new Error('不是有效的 .docx：缺少 word/document.xml');
  const xml = await documentFile.async('string');
  const styleFile = zip.file('word/styles.xml');
  const styleNames = parseStyleNames(styleFile ? await styleFile.async('string') : '');`,
`async function extractDocx(buf) {
  const zip = openZip(buf);
  const xml = zip.text('word/document.xml');
  if (!xml) throw new Error('不是有效的 .docx：缺少 word/document.xml');
  const styleNames = parseStyleNames(zip.text('word/styles.xml') ?? '');`);
c=c.replace(`async function extractPptx(buf) {
  const zip = await JSZip.loadAsync(buf);
  const slides = Object.keys(zip.files)
    .map((name) => {
      const match = name.match(/^ppt\\/slides\\/slide(\\d+)\\.xml$/);
      return match ? { name, index: Number(match[1]) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);

  const blocks = [];
  for (const slide of slides) {
    const xml = await zip.file(slide.name).async('string');`,
`async function extractPptx(buf) {
  const zip = openZip(buf);
  const slides = zip.names()
    .map((name) => {
      const match = name.match(/^ppt\\/slides\\/slide(\\d+)\\.xml$/);
      return match ? { name, index: Number(match[1]) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);

  const blocks = [];
  for (const slide of slides) {
    const xml = zip.text(slide.name) ?? '';`);
fs.writeFileSync(p,c,"utf8");
console.log("patched fflate");
