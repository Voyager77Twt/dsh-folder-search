import fs from "node:fs";
let p="lib/index.js"; let c=fs.readFileSync(p,"utf8");
const old=`function resolveLibrary(args, config, settings = {}) {
  const explicit = args?.library && String(args.library).trim();
  const root = explicit || settings.libraryRoot || config.libraries[0];
  if (!root) {
    throw new Error('还没有指定题库文件夹。请在「本地搜索设置」里填写题库位置，或把绝对路径作为 library 参数传入（例如 D:\\\\题库）。');
  }
  return path.resolve(root);
}`;
const neu=`function resolveLibraries(args, config, settings = {}) {
  const explicit = args?.library && String(args.library).trim();
  const configured = Array.isArray(settings.libraryRoots) && settings.libraryRoots.length
    ? settings.libraryRoots
    : (settings.libraryRoot ? [settings.libraryRoot] : (config.libraries || []));
  const values = explicit ? [explicit] : configured;
  const seen = new Set();
  const roots = [];
  for (const value of values) {
    const root = path.resolve(String(value));
    const key = root.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    roots.push(root);
  }
  if (!roots.length) {
    throw new Error('还没有指定题库文件夹。请在「本地搜索设置」里填写题库位置，或把绝对路径作为 library 参数传入（例如 D:\\\\题库）。');
  }
  return roots;
}

function categoryRank(file) {
  if ((file.directKeywords?.length ?? 0) > 0) return 0;
  if (file.expandedOnly) return 1;
  if (file.relatedOnly) return 2;
  return 3;
}

function mergeSearchResults(results, settings) {
  if (results.length === 1) return results[0];
  const files = results.flatMap((result) => result.files.map((file) => ({ ...file, library: result.library })));
  files.sort((a, b) => categoryRank(a) - categoryRank(b));
  const finalMax = settings.finalMaxFiles ?? 'all';
  const finalLimit = finalMax === 'all' ? Infinity : Math.max(1, Math.min(Number(finalMax), 5000));
  const shown = files.slice(0, finalLimit);
  const totals = {
    files: results.reduce((n, result) => n + (result.totals?.files ?? 0), 0),
    blocks: results.reduce((n, result) => n + (result.totals?.blocks ?? 0), 0),
    directFiles: results.reduce((n, result) => n + (result.totals?.directFiles ?? 0), 0),
    expandedFiles: results.reduce((n, result) => n + (result.totals?.expandedFiles ?? 0), 0),
    relatedFiles: results.reduce((n, result) => n + (result.totals?.relatedFiles ?? 0), 0),
    generalFiles: results.reduce((n, result) => n + (result.totals?.generalFiles ?? 0), 0),
    directBlocks: results.reduce((n, result) => n + (result.totals?.directBlocks ?? 0), 0),
    expandedBlocks: results.reduce((n, result) => n + (result.totals?.expandedBlocks ?? 0), 0),
    relatedBlocks: results.reduce((n, result) => n + (result.totals?.relatedBlocks ?? 0), 0),
    generalBlocks: results.reduce((n, result) => n + (result.totals?.generalBlocks ?? 0), 0),
    fallback: results.some((result) => result.totals?.fallback),
    shownFiles: shown.length,
    shownBlocks: shown.reduce((n, file) => n + (file.blocks?.length ?? 0), 0),
  };
  const stats = {
    ...results[0].stats,
    documents: results.reduce((n, result) => n + (result.stats?.documents ?? 0), 0),
    ready: results.reduce((n, result) => n + (result.stats?.ready ?? 0), 0),
    pending: results.reduce((n, result) => n + (result.stats?.pending ?? 0), 0),
    failed: results.reduce((n, result) => n + (result.stats?.failed ?? 0), 0),
    cacheBytes: results.reduce((n, result) => n + (result.stats?.cacheBytes ?? 0), 0),
    libraryBytes: results.reduce((n, result) => n + (result.stats?.libraryBytes ?? 0), 0),
    capReached: results.some((result) => result.stats?.capReached),
    errors: results.flatMap((result) => result.stats?.errors ?? []),
  };
  const demoted = [...new Set(results.flatMap((result) => result.strongGate?.demoted ?? []))];
  const kept = [...new Set(results.flatMap((result) => result.strongGate?.kept ?? (result.strongGate?.kept ? [result.strongGate.kept] : [])))];
  return {
    ...results[0],
    library: results.map((result) => result.library).join('、'),
    libraries: results.map((result) => result.library),
    files: shown,
    totals,
    stats,
    query: { ...results[0].query, libraries: results.map((result) => result.library) },
    truncated: results.some((result) => result.truncated) || shown.length < files.length,
    strongGate: demoted.length || kept.length ? { kept, demoted } : null,
  };
}

async function searchLibraries(indexes, args, config, settings) {
  if (indexes.length === 1) return searchLibrary(indexes[0].index, args, config, settings);
  const results = [];
  for (const entry of indexes) results.push(await searchLibrary(entry.index, args, config, { ...settings, finalMaxFiles: 'all' }));
  return mergeSearchResults(results, settings);
}`;
if(!c.includes(old)) throw new Error('resolveLibrary marker missing');
c=c.replace(old,neu);
// modify prepareTool
const prepOld=`  const library = resolveLibrary(args, resolved, settings);
  const index = indexFor(library, config);
  return { settings, config, library, index };`;
const prepNew=`  const libraries = resolveLibraries(args, resolved, settings);
  const indexes = libraries.map((library) => ({ library, index: indexFor(library, config) }));
  const library = libraries[0];
  const index = indexes[0].index;
  return { settings, config, library, libraries, indexes, index };`;
if(!c.includes(prepOld)) throw new Error('prepare marker missing');
c=c.replace(prepOld,prepNew);
fs.writeFileSync(p,c,"utf8");
console.log("multi-root prepare/search helpers");
