import fs from "node:fs";
let p="lib/extract.js"; let c=fs.readFileSync(p,"utf8");
const marker="const MAX_BLOCKS = 200000;\n\nfunction openZip(buf) {\n  const files = unzipSync(new Uint8Array(buf));\n  return {\n    names: () => Object.keys(files),\n    text: (name) => (files[name] ? strFromU8(files[name]) : null),\n  };\n}";
const replacement=`const MAX_BLOCKS = 200000;

function securityLimits(options = {}) {
  const security = options.security && typeof options.security === 'object' ? options.security : {};
  const num = (value, fallback, min, max) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
  };
  return {
    zipMaxEntries: num(security.zipMaxEntries, 5000, 16, 20000),
    zipMaxEntryBytes: num(security.zipMaxEntryMB, 64, 1, 1024) * 1024 * 1024,
    zipMaxTotalBytes: num(security.zipMaxTotalMB, 512, 8, 4096) * 1024 * 1024,
    zipMaxRatio: num(security.zipMaxRatio, 200, 2, 1000),
    maxTextChars: num(security.maxTextMB, 20, 1, 200) * 1024 * 1024,
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
c=c.replace("async function extractDocx(buf) {\n  const zip = openZip(buf);\n  const xml = zip.text('word/document.xml');\n  if (!xml) throw new Error('不是有效的 .docx：缺少 word/document.xml');\n  const styleNames = parseStyleNames(zip.text('word/styles.xml') ?? '');","async function extractDocx(buf, options = {}) {\n  const zip = openZip(buf, options);\n  const xml = assertSafeXml(zip.text('word/document.xml'), 'word/document.xml');\n  if (!xml) throw new Error('不是有效的 .docx：缺少 word/document.xml');\n  const styleNames = parseStyleNames(assertSafeXml(zip.text('word/styles.xml') ?? '', 'word/styles.xml'));");
c=c.replace("  return finalize('docx', blocks);","  return finalize('docx', blocks, undefined, options);");
c=c.replace("async function extractPdf(buf) {","async function extractPdf(buf, options = {}) {");
c=c.replace("  return finalize('pdf', blocks);","  return finalize('pdf', blocks, undefined, options);");
c=c.replace("async function extractPptx(buf) {\n  const zip = openZip(buf);","async function extractPptx(buf, options = {}) {\n  const zip = openZip(buf, options);");
c=c.replace("  return finalize('pptx', blocks);","  return finalize('pptx', blocks, undefined, options);");
c=c.replace("function extractXlsx(buf) {\n  const workbook = XLSX.read(buf, { type: 'buffer' });","function extractXlsx(buf, options = {}) {\n  if (buf[0] === 0x50 && buf[1] === 0x4b) assertZipSafe(buf, options);\n  const workbook = XLSX.read(buf, { type: 'buffer' });");
c=c.replace("  return finalize('xlsx', blocks);","  return finalize('xlsx', blocks, undefined, options);");
c=c.replace("async function extractTextFile(buf) {","async function extractTextFile(buf, options = {}) {");
c=c.replace("  return finalize('text', blocks);","  return finalize('text', blocks, undefined, options);");
// slide XML safe
c=c.replace("      const text = normalizeText(slideText);","      const text = normalizeText(assertSafeXml(slideText, 'slide XML'));");
// replace switch body precisely
const oldSwitch=`  switch (kind) {
    case 'docx':
      return extractDocx(buf);
    case 'doc': {
      const legacyDir = options.legacyPdfDir ?? process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR;
      if (legacyDir) {
        const key = sha1(\`\${absPath.toLowerCase()}|\${stat.mtimeMs}|\${stat.size}\`);
        const cachedPdf = path.join(legacyDir, \`\${key}.pdf\`);
        if (exists(cachedPdf)) {
          const pre = await extractPdf(await fs.readFile(cachedPdf));
          return { ...pre, kind: 'doc' };
        }
      }
      if (legacyDir && process.env.DSH_LIBSEARCH_LEGACY_STRICT === '1') {
        throw new Error('旧版文档批量预转换失败，已跳过');
      }
      const pdfBuffer = await convertLegacyToPdf(absPath, { timeoutMs: options.convertTimeoutMs ?? 90000 });
      const result = await extractPdf(pdfBuffer);
      return { ...result, kind: 'doc' };
    }
    case 'ppt': {
      const pdfBuffer = await convertPptToPdf(absPath, { timeoutMs: options.convertTimeoutMs ?? 120000 });
      const result = await extractPdf(pdfBuffer);
      return { ...result, kind: 'ppt' };
    }
    case 'pdf':
      return extractPdf(buf);
    case 'pptx':
      return extractPptx(buf);
    case 'xlsx':
      return extractXlsx(buf);
    case 'text':
      return extractTextFile(buf);
    default:
      throw new Error(\`不支持的文件类型：\${ext}\`);
  }`;
const newSwitch=`  switch (kind) {
    case 'docx':
      return extractDocx(buf, options);
    case 'doc': {
      const legacyDir = options.legacyPdfDir ?? process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR;
      if (legacyDir) {
        const key = sha1(\`\${absPath.toLowerCase()}|\${stat.mtimeMs}|\${stat.size}\`);
        const cachedPdf = path.join(legacyDir, \`\${key}.pdf\`);
        if (exists(cachedPdf)) {
          const pre = await extractPdf(await fs.readFile(cachedPdf), options);
          return { ...pre, kind: 'doc' };
        }
      }
      if (legacyDir && process.env.DSH_LIBSEARCH_LEGACY_STRICT === '1') {
        throw new Error('旧版文档批量预转换失败，已跳过');
      }
      const pdfBuffer = await convertLegacyToPdf(absPath, { timeoutMs: options.convertTimeoutMs ?? 90000, allowMacros: options.officeAllowMacros === true });
      const result = await extractPdf(pdfBuffer, options);
      return { ...result, kind: 'doc' };
    }
    case 'ppt': {
      const pdfBuffer = await convertPptToPdf(absPath, { timeoutMs: options.convertTimeoutMs ?? 120000, allowMacros: options.officeAllowMacros === true });
      const result = await extractPdf(pdfBuffer, options);
      return { ...result, kind: 'ppt' };
    }
    case 'pdf':
      return extractPdf(buf, options);
    case 'pptx':
      return extractPptx(buf, options);
    case 'xlsx':
      return extractXlsx(buf, options);
    case 'text':
      return extractTextFile(buf, options);
    default:
      throw new Error(\`不支持的文件类型：\${ext}\`);
  }`;
if(!c.includes(oldSwitch)) throw new Error('switch marker missing');
c=c.replace(oldSwitch,newSwitch);
fs.writeFileSync(p,c,"utf8");
console.log("limits applied");
