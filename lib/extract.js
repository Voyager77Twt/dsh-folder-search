import fs from 'node:fs/promises';
import path from 'node:path';
import { unzipSync, strFromU8 } from 'fflate';
import XLSX from 'xlsx';
import { getDocumentProxy, extractText } from 'unpdf';
import { SUPPORTED, decodeXmlEntities, normalizeText, collapse, capList, sha1, exists } from './util.js';
import { convertLegacyToPdf, convertPptToPdf } from './office-convert.js';

const QUESTION_RE = /^\s*(?:(?:第\s*)?(\d{1,3})\s*[.、．)）](?!\d)|(?:第\s*)?(\d{1,3})\s*题|(?:Question|Q)\s*[.:：]?\s*(\d{1,3})(?!\d))/i;
const SECTION_RE = /^\s*(?:第\s*[一二三四五六七八九十]+\s*[部分卷节]|[一二三四五六七八九十]+\s*[、.．]|【[^】]{1,20}】)/;
const MAX_BLOCKS = 200000;

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
  if (state.entries > limits.zipMaxEntries) {
    state.error ||= '安全限制：压缩包条目过多';
    return false;
  }
  const size = Math.max(0, Number(file.originalSize) || 0);
  if (size > limits.zipMaxEntryBytes) {
    state.error ||= '安全限制：压缩包单个条目解压后过大';
    return false;
  }
  state.total += size;
  if (state.total > limits.zipMaxTotalBytes) {
    state.error ||= '安全限制：压缩包总解压体积过大';
    return false;
  }
  if (compressedBytes > 0 && state.total / compressedBytes > limits.zipMaxRatio) {
    state.error ||= '安全限制：压缩比异常';
    return false;
  }
  return true;
}

function inspectZipSafety(buf, options = {}) {
  const limits = securityLimits(options);
  const bytes = new Uint8Array(buf);
  const state = { entries: 0, total: 0, error: null };
  unzipSync(bytes, { filter: (file) => { checkZipLimit(file, state, limits, bytes.byteLength); return false; } });
  if (state.error) throw new Error(state.error);
}

function assertZipSafe(buf, options = {}) {
  try {
    inspectZipSafety(buf, options);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('安全限制：')) throw error;
    throw new Error('不是有效的压缩文件：' + (error instanceof Error ? error.message : String(error)));
  }
}

function openZip(buf, options = {}) {
  inspectZipSafety(buf, options);
  const files = unzipSync(new Uint8Array(buf));
  return {
    names: () => Object.keys(files),
    text: (name) => (files[name] ? strFromU8(files[name]) : null),
  };
}

function assertSafeXml(xml, label) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('安全限制：' + label + ' 包含 DTD/实体声明');
  return xml;
}

function emptyStructure() {
  return { sections: [], questions: [] };
}

/** Detect 大题 sections and 题号 starts inside one block's text. */
function detectStructure(block, out) {
  const lines = block.text.split('\n');
  let offset = 0;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    const start = offset;
    offset += raw.length + 1;
    if (!line) continue;
    if (line.length <= 60 && SECTION_RE.test(line)) {
      out.sections.push({ label: line.slice(0, 60), loc: block.loc, line: i + 1, at: start });
      continue;
    }
    const match = line.match(QUESTION_RE);
    if (match && !/^\s*[（(]\s*\d{1,2}\s*[）)]/.test(line)) {
      out.questions.push({ no: match[1] || match[2] || match[3], loc: block.loc, line: i + 1, at: start, preview: line.slice(0, 60) });
    }
  }
}

function finalize(kind, blocks, _structure, options = {}) {
  const limits = securityLimits(options);
  const cleaned = [];
  let totalChars = 0;
  for (const block of blocks) {
    const text = normalizeText(block.text).trim();
    if (!text) continue;
    const room = limits.maxTextChars - totalChars;
    if (room <= 0) break;
    const kept = text.length > room ? text.slice(0, room) : text;
    cleaned.push({ loc: block.loc, text: kept });
    totalChars += kept.length;
    if (kept.length < text.length || cleaned.length >= MAX_BLOCKS) break;
  }
  const structure = emptyStructure();
  for (const block of cleaned) detectStructure(block, structure);
  const sections = [];
  const seenSections = new Set();
  for (const section of structure.sections) {
    const key = `${section.label}@${JSON.stringify(section.loc)}`;
    if (seenSections.has(key)) continue;
    seenSections.add(key);
    sections.push(section);
    if (sections.length >= 80) break;
  }
  const questions = [];
  const seenQuestions = new Set();
  for (const question of structure.questions) {
    const key = `${question.no}@${JSON.stringify(question.loc)}`;
    if (seenQuestions.has(key)) continue;
    seenQuestions.add(key);
    questions.push(question);
    if (questions.length >= 400) break;
  }
  return { kind, blocks: cleaned, sections, questions, chars: cleaned.reduce((sum, b) => sum + b.text.length, 0) };
}

/* ------------------------------------------------------------------ docx */

function parseStyleNames(xml) {
  const names = new Map();
  if (!xml) return names;
  const styles = xml.match(/<w:style\b[\s\S]*?<\/w:style>/g) || [];
  for (const style of styles) {
    const id = (style.match(/w:styleId="([^"]+)"/) || [])[1];
    const name = (style.match(/<w:name\s+w:val="([^"]+)"/) || [])[1];
    if (id && name) names.set(id, name);
  }
  return names;
}

function headingLevel(styleId, styleNames, paragraphXml) {
  const name = styleId ? styleNames.get(styleId) || styleId : '';
  const byName = String(name).match(/(?:heading|标题)\s*(\d)/i);
  if (byName) return Number(byName[1]);
  const outline = paragraphXml.match(/<w:outlineLvl\s+w:val="(\d)"/);
  if (outline) return Number(outline[1]) + 1;
  return 0;
}

function paragraphText(xml) {
  let text = '';
  const parts = xml.match(/<w:t(?:\s[^>]*)?>[\s\S]*?<\/w:t>|<w:tab\s*\/>|<w:br\s*\/>|<w:cr\s*\/>/g) || [];
  for (const part of parts) {
    if (part.startsWith('<w:tab') || part.startsWith('<w:br') || part.startsWith('<w:cr')) {
      text += ' ';
      continue;
    }
    const inner = part.replace(/^<w:t(?:\s[^>]*)?>/, '').replace(/<\/w:t>$/, '');
    text += decodeXmlEntities(inner);
  }
  return text;
}

async function extractDocx(buf, options = {}) {
  const zip = openZip(buf, options);
  const xml = assertSafeXml(zip.text('word/document.xml'), 'word/document.xml');
  if (!xml) throw new Error('不是有效的 .docx：缺少 word/document.xml');
  const styleNames = parseStyleNames(assertSafeXml(zip.text('word/styles.xml') ?? '', 'word/styles.xml'));

  const blocks = [];
  const paragraphs = xml.match(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g) || [];
  const headingStack = [];
  let index = 0;

  for (const paragraph of paragraphs) {
    index += 1;
    const text = paragraphText(paragraph);
    const styleId = (paragraph.match(/<w:pStyle\s+w:val="([^"]+)"/) || [])[1];
    const level = headingLevel(styleId, styleNames, paragraph);
    if (level) {
      while (headingStack.length && headingStack[headingStack.length - 1].level >= level) headingStack.pop();
      headingStack.push({ level, text: collapse(text) || `标题${level}` });
    }
    if (!text.trim()) continue;
    const heading = headingStack.map((h) => h.text).join(' > ');
    const loc = { k: 'docx', p: index, ...(heading ? { h: heading } : {}) };
    const block = { loc, text };
    blocks.push(block);
  }
  return finalize('docx', blocks, undefined, options);
}

/* ------------------------------------------------------------------- pdf */

async function extractPdf(buf, options = {}) {
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  let pages = [];
  try {
    const result = await extractText(pdf, { mergePages: false });
    pages = Array.isArray(result.text) ? result.text : [String(result.text ?? '')];
  } finally {
    try {
      await pdf.destroy();
    } catch {
      /* best effort */
    }
  }
  const blocks = [];
  pages.forEach((pageText, pageIndex) => {
    const text = normalizeText(pageText);
    if (!text.trim()) return;
    const loc = { k: 'pdf', page: pageIndex + 1 };
    const block = { loc, text };
    blocks.push(block);
  });
  return finalize('pdf', blocks, undefined, options);
}

/* ------------------------------------------------------------------ pptx */

async function extractPptx(buf, options = {}) {
  const zip = openZip(buf, options);
  const slides = zip.names()
    .map((name) => {
      const match = name.match(/^ppt\/slides\/slide(\d+)\.xml$/);
      return match ? { name, index: Number(match[1]) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);

  const blocks = [];
  for (const slide of slides) {
    const xml = zip.text(slide.name) ?? '';
    const runs = xml.match(/<a:t>[\s\S]*?<\/a:t>/g) || [];
    const text = runs.map((run) => decodeXmlEntities(run.replace(/^<a:t>/, '').replace(/<\/a:t>$/, ''))).join('\n');
    if (!text.trim()) continue;
    const loc = { k: 'pptx', slide: slide.index };
    const block = { loc, text };
    blocks.push(block);
  }
  return finalize('pptx', blocks, undefined, options);
}

/* ------------------------------------------------------------------ xlsx */

function extractXlsx(buf, options = {}) {
  if (buf[0] === 0x50 && buf[1] === 0x4b) assertZipSafe(buf, options);
  const workbook = XLSX.read(buf, { type: 'buffer' });
  const blocks = [];
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet || !sheet['!ref']) continue;
    const range = XLSX.utils.decode_range(sheet['!ref']);
    let cells = 0;
    for (let row = range.s.r; row <= range.e.r && cells < 60000; row++) {
      for (let col = range.s.c; col <= range.e.c && cells < 60000; col++) {
        const address = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = sheet[address];
        if (!cell) continue;
        const text = normalizeText(cell.w != null ? String(cell.w) : String(cell.v ?? '')).trim();
        if (!text) continue;
        cells += 1;
        const loc = { k: 'xlsx', sheet: sheetName, cell: address };
        const block = { loc, text };
        blocks.push(block);
      }
    }
  }
  return finalize('xlsx', blocks, undefined, options);
}

/* ------------------------------------------------------------------ text */

async function extractTextFile(buf, options = {}) {
  const content = normalizeText(buf.toString('utf8'));
  const blocks = [];
  content.split('\n').forEach((line, index) => {
    if (!line.trim()) return;
    const loc = { k: 'text', line: index + 1 };
    const block = { loc, text: line };
    blocks.push(block);
  });
  return finalize('text', blocks, undefined, options);
}

/* -------------------------------------------------------------- dispatcher */

export async function extractFile(absPath, ext, options = {}) {
  const kind = SUPPORTED.get(String(ext).toLowerCase());
  if (!kind) throw new Error(`不支持的文件类型：${ext}`);
  const stat = await fs.stat(absPath);
  const maxBytes = (options.maxFileMB ?? 60) * 1024 * 1024;
  if (stat.size > maxBytes) throw new Error(`文件超过 ${options.maxFileMB ?? 60} MB 上限`);
  const buf = await fs.readFile(absPath);
  switch (kind) {
    case 'docx':
      return extractDocx(buf, options);
    case 'doc': {
      const legacyDir = options.legacyPdfDir ?? process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR;
      if (legacyDir) {
        const key = sha1(`${absPath.toLowerCase()}|${stat.mtimeMs}|${stat.size}`);
        const cachedPdf = path.join(legacyDir, `${key}.pdf`);
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
      throw new Error(`不支持的文件类型：${ext}`);
  }
}

export { detectStructure, QUESTION_RE, SECTION_RE };
