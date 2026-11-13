import fs from "node:fs";
let p="lib/extract.js"; let c=fs.readFileSync(p,"utf8");
const marker="const MAX_BLOCKS = 200000;\n\nfunction openZip(buf) {\n  const files = unzipSync(new Uint8Array(buf));\n  return {\n    names: () => Object.keys(files),\n    text: (name) => (files[name] ? strFromU8(files[name]) : null),\n  };\n}";
const replacement=`const MAX_BLOCKS = 200000;

function securityLimits(options = {}) {
  const security = options.security && typeof options.security === 'object' ? options.security : {};
  const mb = (value, fallback, min, max) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
  };
  return {
    zipMaxEntries: mb(security.zipMaxEntries, 5000, 16, 20000),
    zipMaxEntryBytes: mb(security.zipMaxEntryMB, 64, 1, 1024) * 1024 * 1024,
    zipMaxTotalBytes: mb(security.zipMaxTotalMB, 512, 8, 4096) * 1024 * 1024,
    zipMaxRatio: mb(security.zipMaxRatio, 200, 2, 1000),
    maxTextChars: mb(security.maxTextMB, 20, 1, 200) * 1024 * 1024,
  };
}

function checkZipLimit(file, state, limits, compressedBytes) {
  state.entries += 1;
  if (state.entries > limits.zipMaxEntries) throw new Error('安全限制：压缩包条目过多');
  const size = Math.max(0, Number(file.originalSize) || 0);
  if (size > limits.zipMaxEntryBytes) throw new Error('安全限制：压缩包单个条目解压后过大');
  state.total += size;
  if (state.total > limits.zipMaxTotalBytes) throw new Error('安全限制：压缩包总解压体积过大');
  if (compressedBytes > 0 && state.total / compressedBytes > limits.zipMaxRatio) throw new Error('安全限制：压缩比异常');
}

function assertZipSafe(buf, options = {}) {
  const limits = securityLimits(options);
  const bytes = new Uint8Array(buf);
  const state = { entries: 0, total: 0 };
  try {
    unzipSync(bytes, { filter: (file) => { checkZipLimit(file, state, limits, bytes.byteLength); return false; } });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('安全限制：')) throw error;
    throw new Error('不是有效的压缩文件：' + (error instanceof Error ? error.message : String(error)));
  }
}

function openZip(buf, options = {}) {
  const limits = securityLimits(options);
  const bytes = new Uint8Array(buf);
  const state = { entries: 0, total: 0 };
  const files = unzipSync(bytes, {
    filter: (file) => { checkZipLimit(file, state, limits, bytes.byteLength); return true; },
  });
  return {
    names: () => Object.keys(files),
    text: (name) => (files[name] ? strFromU8(files[name]) : null),
  };
}

function assertSafeXml(xml, label) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('安全限制：' + label + ' 包含 DTD/实体声明');
  return xml;
}`;
if(!c.includes(marker)) throw new Error('openZip marker missing');
c=c.replace(marker,replacement);
c=c.replace("function finalize(kind, blocks, _structure) {\n  const cleaned = [];\n  for (const block of blocks) {\n    const text = normalizeText(block.text).trim();\n    if (!text) continue;\n    cleaned.push({ loc: block.loc, text });\n    if (cleaned.length >= MAX_BLOCKS) break;\n  }","function finalize(kind, blocks, _structure, options = {}) {\n  const limits = securityLimits(options);\n  const cleaned = [];\n  let totalChars = 0;\n  for (const block of blocks) {\n    const text = normalizeText(block.text).trim();\n    if (!text) continue;\n    const room = limits.maxTextChars - totalChars;\n    if (room <= 0) break;\n    const kept = text.length > room ? text.slice(0, room) : text;\n    cleaned.push({ loc: block.loc, text: kept });\n    totalChars += kept.length;\n    if (kept.length < text.length || cleaned.length >= MAX_BLOCKS) break;\n  }");
for (const [old,neu] of [
 ["async function extractDocx(buf) {\n  const zip = openZip(buf);\n  const xml = zip.text('word/document.xml');\n  if (!xml) throw new Error('不是有效的 .docx：缺少 word/document.xml');\n  const styleNames = parseStyleNames(zip.text('word/styles.xml') ?? '');","async function extractDocx(buf, options = {}) {\n  const zip = openZip(buf, options);\n  const xml = assertSafeXml(zip.text('word/document.xml'), 'word/document.xml');\n  if (!xml) throw new Error('不是有效的 .docx：缺少 word/document.xml');\n  const styleNames = parseStyleNames(assertSafeXml(zip.text('word/styles.xml') ?? '', 'word/styles.xml'));"],
 ["  return finalize('docx', blocks);","  return finalize('docx', blocks, undefined, options);"],
 ["async function extractPdf(buf) {","async function extractPdf(buf, options = {}) {"],
 ["  return finalize('pdf', blocks);","  return finalize('pdf', blocks, undefined, options);"],
 ["async function extractPptx(buf) {\n  const zip = openZip(buf);","async function extractPptx(buf, options = {}) {\n  const zip = openZip(buf, options);"],
 ["  return finalize('pptx', blocks);","  return finalize('pptx', blocks, undefined, options);"],
 ["function extractXlsx(buf) {\n  const workbook = XLSX.read(buf, { type: 'buffer' });","function extractXlsx(buf, options = {}) {\n  if (buf[0] === 0x50 && buf[1] === 0x4b) assertZipSafe(buf, options);\n  const workbook = XLSX.read(buf, { type: 'buffer' });"],
 ["  return finalize('xlsx', blocks);","  return finalize('xlsx', blocks, undefined, options);"],
 ["async function extractTextFile(buf) {","async function extractTextFile(buf, options = {}) {"],
 ["  return finalize('text', blocks);","  return finalize('text', blocks, undefined, options);"],
 ["      return extractDocx(buf);","      return extractDocx(buf, options);"],
 ["          const pre = await extractPdf(await fs.readFile(cachedPdf));","          const pre = await extractPdf(await fs.readFile(cachedPdf), options);"],
 ["        const pdfBuffer = await convertLegacyToPdf(absPath, { timeoutMs: options.convertTimeoutMs ?? 90000 });\n        const result = await extractPdf(pdfBuffer);","        const pdfBuffer = await convertLegacyToPdf(absPath, { timeoutMs: options.convertTimeoutMs ?? 90000, allowMacros: options.officeAllowMacros === true });\n        const result = await extractPdf(pdfBuffer, options);"],
 ["        const pdfBuffer = await convertPptToPdf(absPath, { timeoutMs: options.convertTimeoutMs ?? 120000 });\n        const result = await extractPdf(pdfBuffer);","        const pdfBuffer = await convertPptToPdf(absPath, { timeoutMs: options.convertTimeoutMs ?? 120000, allowMacros: options.officeAllowMacros === true });\n        const result = await extractPdf(pdfBuffer, options);"],
 ["      return extractPdf(buf);","      return extractPdf(buf, options);"],
 ["      return extractPptx(buf);","      return extractPptx(buf, options);"],
 ["      return extractXlsx(buf);","      return extractXlsx(buf, options);"],
 ["      return extractTextFile(buf);","      return extractTextFile(buf, options);"]
]) { if(!c.includes(old)) throw new Error('marker missing: '+old.slice(0,50)); c=c.replace(old,neu); }
// make slide XML safe
c=c.replace("      const text = normalizeText(slideText);","      const text = normalizeText(assertSafeXml(slideText, 'slide XML'));");
fs.writeFileSync(p,c,"utf8");
console.log("zip/text/xml limits");
