import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveCacheRoot } from './util.js';

/** 用户可在「本地搜索设置」页修改；只影响输出，不影响索引内容。 */
export const DEFAULT_SETTINGS = {
  libraryRoot: '',
  libraryRoots: [],
  cacheDir: '',
  expand: true,
  normalMaxFiles: 16,
  normalMaxBlocksPerFile: 2,
  normalSnippetChars: 90,
  expandMaxFiles: 6,
  expandMaxBlocksPerFile: 2,
  expandSnippetChars: 30,
  associationLimit: 2,
  generalLimit: 1,
  strongLimit: 2,
  strongGateMode: 'all',
  strongGateFiles: 50,
  strongGateFactor: 2,
  strongGateRatio: 20,
  strongGateSuffixes: ['题目', '试题', '领域', '行业', '产业'],
  strongRetry: false,
  strongRetryMax: 1,
  strongMaxFiles: 8,
  strongMaxBlocksPerFile: 2,
  strongSnippetChars: 60,
  enableStrong: true,
  enableGeneral: true,
  allowGeneralFiles: false,
  customAssociations: {},
  dedupe: false,
  outlineMaxFiles: 60,
  indexConcurrency: 3,
  maxFileMB: 200,
  finalMaxFiles: 30,
  searchMode: 'default',
  syncBeforeSearch: true,
  includeSnippets: true,
  includeQuestionNumbers: true,
  matchScope: 'file',
  zipMaxEntries: 5000,
  zipMaxEntryMB: 64,
  zipMaxTotalMB: 512,
  zipMaxRatio: 200,
  maxTextMB: 20,
  parseIsolation: true,
  parseWorkerMB: 256,
  officeAllowMacros: false,
};

export function settingsPath() {
  return path.join(resolveCacheRoot({}), 'settings.json');
}

export function normalizeLibraryRoots(value) {
  const raw = Array.isArray(value) ? value : String(value ?? '').split(/[,，\n]/);
  const seen = new Set();
  const out = [];
  for (const item of raw) {
    const root = String(item ?? '').trim();
    if (!root) continue;
    const key = root.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(root);
    if (out.length >= 20) break;
  }
  return out;
}

function integer(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

export function sanitizeSettings(input = {}) {
  const base = { ...DEFAULT_SETTINGS };
  const source = input && typeof input === 'object' ? input : {};
  if (typeof source.expand === 'boolean') base.expand = source.expand;
  base.normalMaxFiles = source.normalMaxFiles === 'all' ? 'all' : integer(source.normalMaxFiles, 1, 5000, base.normalMaxFiles);
  base.normalMaxBlocksPerFile = integer(source.normalMaxBlocksPerFile, 1, 50, base.normalMaxBlocksPerFile);
  base.normalSnippetChars = integer(source.normalSnippetChars, 20, 400, base.normalSnippetChars);
  base.expandMaxFiles = source.expandMaxFiles === 'all' ? 'all' : integer(source.expandMaxFiles, 1, 5000, base.expandMaxFiles);
  base.expandMaxBlocksPerFile = integer(source.expandMaxBlocksPerFile, 1, 50, base.expandMaxBlocksPerFile);
  base.expandSnippetChars = integer(source.expandSnippetChars, 20, 400, base.expandSnippetChars);
  base.associationLimit = integer(source.associationLimit, 1, 8, base.associationLimit);
  base.generalLimit = integer(source.generalLimit, 0, 8, integer(source.associationLimit, 1, 8, base.associationLimit));
  base.strongLimit = integer(source.strongLimit, 0, 4, base.strongLimit);
  if (typeof source.enableStrong === 'boolean') base.enableStrong = source.enableStrong;
  if (['factor','files','ratio','domain','all'].includes(source.strongGateMode)) base.strongGateMode = source.strongGateMode;
  base.strongGateFiles = integer(source.strongGateFiles, 1, 5000, base.strongGateFiles);
  base.strongGateFactor = integer(source.strongGateFactor, 1, 10, base.strongGateFactor);
  base.strongGateRatio = integer(source.strongGateRatio, 1, 100, base.strongGateRatio);
  const suffixSource = Array.isArray(source.strongGateSuffixes) ? source.strongGateSuffixes.join('\n') : source.strongGateSuffixes;
  base.strongGateSuffixes = String(suffixSource ?? base.strongGateSuffixes.join('\n')).split(/[,，\n]/).map((item) => item.trim()).filter(Boolean).slice(0, 50);
  if (typeof source.strongRetry === 'boolean') base.strongRetry = source.strongRetry;
  base.strongRetryMax = integer(source.strongRetryMax, 0, 5, base.strongRetryMax);
  base.strongMaxFiles = source.strongMaxFiles === 'all' ? 'all' : integer(source.strongMaxFiles, 1, 5000, base.strongMaxFiles);
  base.strongMaxBlocksPerFile = integer(source.strongMaxBlocksPerFile, 1, 50, base.strongMaxBlocksPerFile);
  base.strongSnippetChars = integer(source.strongSnippetChars, 20, 400, base.strongSnippetChars);
  if (typeof source.enableGeneral === 'boolean') base.enableGeneral = source.enableGeneral;
  if (typeof source.allowGeneralFiles === 'boolean') base.allowGeneralFiles = source.allowGeneralFiles;
  const custom = {};
  if (source.customAssociations && typeof source.customAssociations === 'object') {
    for (const [key, value] of Object.entries(source.customAssociations)) {
      if (!key || !Array.isArray(value)) continue;
      const terms = value.map((term) => String(term).trim()).filter(Boolean).slice(0, 8);
      if (terms.length) custom[key.trim()] = terms;
      if (Object.keys(custom).length >= 200) break;
    }
  }
  base.customAssociations = custom;
  if (typeof source.dedupe === 'boolean') base.dedupe = source.dedupe;
  base.outlineMaxFiles = integer(source.outlineMaxFiles, 1, 200, base.outlineMaxFiles);
  base.indexConcurrency = integer(source.indexConcurrency, 1, 8, base.indexConcurrency);
  base.maxFileMB = integer(source.maxFileMB, 1, 2000, base.maxFileMB);
  base.libraryRoots = normalizeLibraryRoots(source.libraryRoots !== undefined ? source.libraryRoots : (source.libraryRoot || base.libraryRoot));
  base.libraryRoot = base.libraryRoots[0] || '';
  base.cacheDir = typeof source.cacheDir === 'string' ? source.cacheDir.trim() : base.cacheDir;
  base.finalMaxFiles = source.finalMaxFiles === 'all' ? 'all' : integer(source.finalMaxFiles, 1, 5000, base.finalMaxFiles);
  if (['original', 'default', 'full', 'custom'].includes(source.searchMode)) base.searchMode = source.searchMode;
  if (typeof source.syncBeforeSearch === 'boolean') base.syncBeforeSearch = source.syncBeforeSearch;
  if (typeof source.includeSnippets === 'boolean') base.includeSnippets = source.includeSnippets;
  if (typeof source.includeQuestionNumbers === 'boolean') base.includeQuestionNumbers = source.includeQuestionNumbers;
  if (source.matchScope === 'file' || source.matchScope === 'block') base.matchScope = source.matchScope;
  base.zipMaxEntries = integer(source.zipMaxEntries, 16, 20000, base.zipMaxEntries);
  base.zipMaxEntryMB = integer(source.zipMaxEntryMB, 1, 1024, base.zipMaxEntryMB);
  base.zipMaxTotalMB = integer(source.zipMaxTotalMB, 8, 4096, base.zipMaxTotalMB);
  base.zipMaxRatio = integer(source.zipMaxRatio, 2, 1000, base.zipMaxRatio);
  base.maxTextMB = integer(source.maxTextMB, 1, 200, base.maxTextMB);
  if (typeof source.parseIsolation === 'boolean') base.parseIsolation = source.parseIsolation;
  base.parseWorkerMB = integer(source.parseWorkerMB, 64, 1024, base.parseWorkerMB);
  if (typeof source.officeAllowMacros === 'boolean') base.officeAllowMacros = source.officeAllowMacros;
  return base;
}

export async function loadSettings() {
  try {
    const raw = await fs.readFile(settingsPath(), 'utf8');
    return sanitizeSettings(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(patch = {}) {
  const current = await loadSettings();
  const next = sanitizeSettings({ ...current, ...patch });
  await fs.mkdir(path.dirname(settingsPath()), { recursive: true });
  const tmp = `${settingsPath()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(next, null, 2), 'utf8');
  await fs.rename(tmp, settingsPath());
  return next;
}
