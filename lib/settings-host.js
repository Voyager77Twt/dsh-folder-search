import fs from 'node:fs/promises';
import path from 'node:path';
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from './settings-store.js';
import { resolveCacheRoot } from './util.js';
import { indexFor } from './indexer.js';
import { collectPendingLegacy, preconvertLegacy } from './legacy-batch.js';

export const name = 'folder-search-settings';
export const inject = ['webServer'];

const SETTINGS_ROUTE = '/api/dsh-folder-search/settings';
const INDEX_ROUTE = '/api/dsh-folder-search/index';
const MAX_BODY = 64 * 1024;

function sameOrigin(request) {
  const origin = request.headers?.origin;
  if (!origin) return true;
  const host = request.headers?.host;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function apply(ctx) {
  registerSettingsRoute(ctx);
}

export async function migrateCacheRoots(fromSetting, toSetting) {
  const from = path.resolve(resolveCacheRoot({ cacheDir: fromSetting || undefined }));
  const to = path.resolve(resolveCacheRoot({ cacheDir: toSetting || undefined }));
  if (from.toLowerCase() === to.toLowerCase()) return null;
  let entries = [];
  try {
    entries = await fs.readdir(from, { withFileTypes: true });
  } catch {
    return { from, to, moved: 0, skipped: 0 };
  }
  await fs.mkdir(to, { recursive: true });
  let moved = 0;
  let skipped = 0;
  const copiedSources = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith('lib-')) continue;
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (await fs.stat(target).then(() => true).catch(() => false)) {
      skipped += 1;
      continue;
    }
    await fs.cp(source, target, { recursive: true });
    copiedSources.push(source);
    moved += 1;
  }
  let removed = 0;
  const removeFailed = [];
  for (const source of copiedSources) {
    try {
      await fs.rm(source, { recursive: true, force: true });
      removed += 1;
    } catch {
      removeFailed.push(path.basename(source));
    }
  }
  return { from, to, moved, skipped, removed, removeFailed };
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY) throw new Error('请求体过大');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function send(response, status, value) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(JSON.stringify(value));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function summarizeSync(result) {
  return {
    documents: result.documents ?? 0,
    ready: result.ready ?? 0,
    pending: Math.max(0, (result.pending ?? 0) - (result.failed ?? 0)),
    failed: result.failed ?? 0,
    changed: result.changed ?? 0,
    cacheBytes: result.cacheBytes ?? 0,
    libraryBytes: result.libraryBytes ?? 0,
    cacheCapMB: result.cacheCapMB ?? 250,
    capReached: Boolean(result.capReached),
    workTotal: result.workTotal ?? 0,
    processed: result.processed ?? 0,
    errors: Array.isArray(result.errors) ? result.errors.slice(0, 5) : [],
  };
}

let activeBuild = null;

function buildSnapshot(job) {
  if (!job) return null;
  return {
    configured: true,
    running: job.running,
    libraryRoot: job.libraryRoot,
    cacheDir: job.cacheDir,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt || null,
    ...job.last,
  };
}

async function runBuild(job) {
  const dirs = [];
  const skip = new Set();
  const originalDir = process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR;
  const originalStrict = process.env.DSH_LIBSEARCH_LEGACY_STRICT;
  let legacyConverted = 0;
  try {
    const index = indexFor(job.libraryRoot, {
      cacheDir: job.cacheDir || undefined,
      indexConcurrency: job.indexConcurrency,
      maxFileMB: job.maxFileMB,
    });
    for (let round = 0; round < 10000; round += 1) {
      if (job.cancelled) break;
      const pendingLegacy = await collectPendingLegacy(index, 20, skip);
      if (pendingLegacy.length) {
        job.last = { ...job.last, phase: 'legacy', legacyPending: pendingLegacy.length, legacyConverted, legacyCurrent: pendingLegacy[0]?.rel || null };
        const batch = await preconvertLegacy(index, pendingLegacy);
        dirs.push(batch.dir);
        legacyConverted += batch.converted;
        for (const failure of batch.failed) skip.add(failure.src);
        process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR = batch.dir;
        process.env.DSH_LIBSEARCH_LEGACY_STRICT = '1';
      }
      const result = await index.sync({
        budget: 200,
        retryErrors: true,
        onProgress: (progress) => {
          job.last = { ...job.last, ...progress, phase: 'sync', legacyConverted, legacyCurrent: null };
        },
      });
      job.last = { ...summarizeSync(result), phase: 'sync', legacyConverted, legacyCurrent: null };
      if (job.last.capReached) {
        job.error = '缓存上限已到，建库暂停';
        break;
      }
      if (job.last.pending <= 0) {
        const next = await collectPendingLegacy(index, 1, skip);
        if (!next.length) break;
      }
      if (!result.changed && job.last.pending > 0) await sleep(150);
    }
    if (!job.error) {
      const stats = await index.stats();
      job.last = { ...(job.last || {}), cacheBytes: stats.cacheBytes, updatedAt: stats.updatedAt };
    }
  } catch (error) {
    job.error = error instanceof Error ? error.message : String(error);
  } finally {
    if (originalDir === undefined) delete process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR;
    else process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR = originalDir;
    if (originalStrict === undefined) delete process.env.DSH_LIBSEARCH_LEGACY_STRICT;
    else process.env.DSH_LIBSEARCH_LEGACY_STRICT = originalStrict;
    for (const dir of dirs) await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
    job.running = false;
    job.finishedAt = Date.now();
  }
}


function startBuild(settings, force = false) {
  if (!settings.libraryRoot) throw new Error('还没有填写题库位置');
  if (activeBuild?.running) {
    if (activeBuild.libraryRoot === path.resolve(settings.libraryRoot)) return activeBuild;
    throw new Error('已有另一个索引任务在运行，请等它完成');
  }
  if (activeBuild && !force && activeBuild.libraryRoot === path.resolve(settings.libraryRoot) && activeBuild.cacheDir === (settings.cacheDir ? path.resolve(settings.cacheDir) : '')) {
    return activeBuild;
  }
  const job = {
    running: true,
    libraryRoot: path.resolve(settings.libraryRoot),
    cacheDir: settings.cacheDir ? path.resolve(settings.cacheDir) : '',
    indexConcurrency: settings.indexConcurrency,
    maxFileMB: settings.maxFileMB,
    startedAt: Date.now(),
    finishedAt: null,
    error: null,
    last: { documents: 0, ready: 0, pending: 0, failed: 0, changed: 0, cacheBytes: 0, libraryBytes: 0, cacheCapMB: 250, capReached: false, errors: [] },
    cancelled: false,
  };
  activeBuild = job;
  setImmediate(() => runBuild(job));
  return job;
}

async function indexStatus(settings) {
  if (!settings.libraryRoot) return { configured: false };
  if (activeBuild?.running && activeBuild.libraryRoot === path.resolve(settings.libraryRoot)) {
    return buildSnapshot(activeBuild);
  }
  const index = indexFor(settings.libraryRoot, { cacheDir: settings.cacheDir || undefined, maxFileMB: settings.maxFileMB });
  const scan = await index.sync({ budget: 0 });
  return {
    configured: true,
    running: false,
    libraryRoot: settings.libraryRoot,
    cacheDir: index.cacheDir,
    startedAt: null,
    finishedAt: activeBuild?.finishedAt || null,
    ...summarizeSync(scan),
  };
}

export function registerSettingsRoute(ctx) {
  const web = ctx.get('webServer');
  if (!web || typeof web.register !== 'function') return;
  return ctx.effect(() => {
    const disposeSettings = web.register({
      kind: 'exact',
      path: SETTINGS_ROUTE,
      handler: async (request, response) => {
        try {
          if (!sameOrigin(request)) {
            send(response, 403, { error: '只允许本机同源请求' });
            return;
          }
          if (request.method === 'GET' || request.method === 'HEAD') {
            const settings = await loadSettings();
            send(response, 200, { settings, defaults: DEFAULT_SETTINGS });
            return;
          }
          if (request.method !== 'POST') {
            response.writeHead(405, { allow: 'GET, HEAD, POST' });
            response.end();
            return;
          }
          const body = await readJson(request);
          const before = await loadSettings();
          const requested = body?.settings ?? body ?? {};
          const nextCache = typeof requested.cacheDir === 'string' ? requested.cacheDir.trim() : before.cacheDir;
          const migration = nextCache === before.cacheDir ? null : await migrateCacheRoots(before.cacheDir, nextCache);
          const settings = await saveSettings(requested);
          const pathChanged = before.libraryRoot !== settings.libraryRoot || before.cacheDir !== settings.cacheDir || before.maxFileMB !== settings.maxFileMB;
          let buildQueued = false;
          let buildError = null;
          if (settings.libraryRoot && pathChanged) {
            try {
              startBuild(settings);
              buildQueued = true;
            } catch (error) {
              buildError = error instanceof Error ? error.message : String(error);
            }
          }
          send(response, 200, { settings, defaults: DEFAULT_SETTINGS, migration, buildQueued, buildError });
        } catch (error) {
          send(response, 400, { error: error instanceof Error ? error.message : String(error) });
        }
      },
    });

    const disposeIndex = web.register({
      kind: 'exact',
      path: INDEX_ROUTE,
      handler: async (request, response) => {
        try {
          if (!sameOrigin(request)) {
            send(response, 403, { error: '只允许本机同源请求' });
            return;
          }
          const settings = await loadSettings();
          if (request.method === 'GET' || request.method === 'HEAD') {
            send(response, 200, { status: await indexStatus(settings) });
            return;
          }
          if (request.method !== 'POST') {
            response.writeHead(405, { allow: 'GET, HEAD, POST' });
            response.end();
            return;
          }
          const body = await readJson(request);
          if (body?.action !== 'build') {
            send(response, 400, { error: '未知操作' });
            return;
          }
          if (!settings.libraryRoot) {
            send(response, 400, { error: '请先填写并保存题库位置' });
            return;
          }
          const stat = await fs.stat(settings.libraryRoot);
          if (!stat.isDirectory()) {
            send(response, 400, { error: '题库位置不是文件夹：' + settings.libraryRoot });
            return;
          }
          const job = startBuild(settings, true);
          send(response, 200, { started: true, status: buildSnapshot(job) });
        } catch (error) {
          send(response, 400, { error: error instanceof Error ? error.message : String(error) });
        }
      },
    });

    return () => {
      disposeSettings();
      disposeIndex();
    };
  });
}
