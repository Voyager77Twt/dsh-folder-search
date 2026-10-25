import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

/** Extension -> extractor kind. `doc`/`xls` binary formats are intentionally absent. */
export const SUPPORTED = new Map([
  ['.docx', 'docx'],
  ['.doc', 'doc'],
  ['.rtf', 'doc'],
  ['.pdf', 'pdf'],
  ['.pptx', 'pptx'],
  ['.ppsx', 'pptx'],
  ['.ppt', 'ppt'],
  ['.xlsx', 'xlsx'],
  ['.xls', 'xlsx'],
  ['.txt', 'text'],
  ['.md', 'text'],
  ['.csv', 'text'],
  ['.tsv', 'text'],
]);

export const SKIP_DIRS = new Set(['node_modules', '.git', '.svn', '.hg', '$RECYCLE.BIN', 'System Volume Information']);

export function sha1(value) {
  return crypto.createHash('sha1').update(String(value)).digest('hex');
}

export function rootKey(root) {
  return sha1(path.resolve(root).toLowerCase()).slice(0, 12);
}

export function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(p) {
  await fs.promises.mkdir(p, { recursive: true });
}

export function humanBytes(n) {
  if (!Number.isFinite(n) || n < 0) return '?';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

/** Cache root: `%LOCALAPPDATA%\dsh-library-search` on Windows, ~/.cache elsewhere. */
export function resolveCacheRoot(config = {}) {
  if (config.cacheDir) return path.resolve(config.cacheDir);
  const local = process.env.LOCALAPPDATA;
  if (local) return path.join(local, 'dsh-library-search');
  return path.join(os.homedir(), '.cache', 'dsh-library-search');
}

/**
 * Locate the ripgrep binary. DSH ships one inside app.asar.unpacked; a plain
 * `rg` on PATH is the fallback. Returns a string that may not exist.
 */
export function resolveRg(config = {}) {
  const candidates = [];
  if (config.rgPath) candidates.push(config.rgPath);
  const rel = path.join('app.asar.unpacked', 'node_modules', '@vscode', 'ripgrep-win32-x64', 'bin', 'rg.exe');
  if (process.resourcesPath) candidates.push(path.join(process.resourcesPath, rel));
  candidates.push(path.join(path.dirname(process.execPath), 'resources', rel));
  for (const candidate of candidates) if (candidate && exists(candidate)) return candidate;
  return 'rg';
}

export function decodeXmlEntities(text) {
  return String(text)
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

export function normalizeText(text) {
  return String(text ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/\u0000/g, '')
    .replace(/[ \t]+\n/g, '\n');
}

/** Collapse all whitespace to single spaces; used for snippets and labels. */
export function collapse(text) {
  return String(text ?? '').replace(/\s+/g, ' ').trim();
}

export function toPosix(p) {
  return String(p).replace(/\\/g, '/');
}

export function isInside(parent, child) {
  const rel = path.relative(path.resolve(parent), path.resolve(child));
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

export function safeJson(text, fallback = undefined) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export function capList(list, max) {
  return Array.isArray(list) && list.length > max ? list.slice(0, max) : list;
}

/** Pick the first line that carries a term, for a one-line location preview. */
export function firstLineWith(text, terms) {
  const lower = text.toLowerCase();
  const lines = text.split('\n');
  let best = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const hit = terms.find((term) => trimmed.toLowerCase().includes(String(term).toLowerCase()));
    if (hit) return trimmed;
    if (!best) best = trimmed;
  }
  return best;
}
