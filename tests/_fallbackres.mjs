import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
const old=`  const directResults = results.filter((file) => (file.directKeywords?.length ?? 0) > 0);
  const expandedResults = results.filter((file) => file.expandedOnly);
  const relatedResults = results.filter((file) => file.relatedOnly);
  const shownDirect = directResults.slice(0, normalLimit);
  const shownExpanded = expandedResults.slice(0, assocLimit);
  const shownRelated = relatedResults.slice(0, strongLimit);
  let truncated = shownDirect.length < directResults.length || shownExpanded.length < expandedResults.length || shownRelated.length < relatedResults.length;
  results = [...shownDirect, ...shownExpanded, ...shownRelated];
  const finalMax = settings.finalMaxFiles ?? 'all';`;
const neu=`  const directResults = results.filter((file) => (file.directKeywords?.length ?? 0) > 0);
  const expandedResults = results.filter((file) => file.expandedOnly);
  const relatedResults = results.filter((file) => file.relatedOnly);
  const generalResults = results.filter((file) => file.generalOnly);
  const fallback = directResults.length === 0 && relatedResults.length === 0;
  const asLimit = (value) => value === 'all' ? 5000 : Math.max(1, Math.min(Number(value), 5000));
  const fallbackLimit = fallback ? Math.min(5000, asLimit(strongMax) + asLimit(assocMax)) : 0;
  let shownDirect = [];
  let shownExpanded = [];
  let shownRelated = [];
  let shownGeneral = [];
  if (fallback) {
    shownExpanded = expandedResults.slice(0, fallbackLimit);
    shownGeneral = generalResults.slice(0, Math.max(0, fallbackLimit - shownExpanded.length));
    results = [...shownExpanded, ...shownGeneral];
  } else {
    shownDirect = directResults.slice(0, normalLimit);
    shownExpanded = expandedResults.slice(0, assocLimit);
    shownRelated = relatedResults.slice(0, strongLimit);
    shownGeneral = settings.allowGeneralFiles
      ? generalResults.slice(0, Math.max(0, assocLimit - shownExpanded.length))
      : [];
    results = [...shownDirect, ...shownExpanded, ...shownRelated, ...shownGeneral];
  }
  let truncated = (directResults.length > shownDirect.length) || (expandedResults.length > shownExpanded.length) || (relatedResults.length > shownRelated.length) || (generalResults.length > shownGeneral.length);
  const finalMax = settings.finalMaxFiles ?? 'all';`;
if(!c.includes(old)) throw new Error('results block marker missing');
c=c.replace(old,neu);
c=c.replace("  const totals = {\n    files: directResults.length + expandedResults.length + relatedResults.length,\n    blocks: directResults.reduce((sum, file) => sum + file.blocksHit, 0) + expandedResults.reduce((sum, file) => sum + file.blocksHit, 0) + relatedResults.reduce((sum, file) => sum + file.blocksHit, 0),\n    directFiles: directResults.length,\n    expandedFiles: expandedResults.length,\n    relatedFiles: relatedResults.length,","  const totals = {\n    files: directResults.length + expandedResults.length + relatedResults.length + generalResults.length,\n    blocks: [...directResults, ...expandedResults, ...relatedResults, ...generalResults].reduce((sum, file) => sum + file.blocksHit, 0),\n    directFiles: directResults.length,\n    expandedFiles: expandedResults.length,\n    relatedFiles: relatedResults.length,\n    generalFiles: generalResults.length,\n    fallback,");
c=c.replace("    directBlocks: directResults.reduce((sum, file) => sum + file.blocksHit, 0),\n    expandedBlocks: expandedResults.reduce((sum, file) => sum + file.blocksHit, 0),\n    relatedBlocks: relatedResults.reduce((sum, file) => sum + file.blocksHit, 0),","    directBlocks: directResults.reduce((sum, file) => sum + file.blocksHit, 0),\n    expandedBlocks: expandedResults.reduce((sum, file) => sum + file.blocksHit, 0),\n    relatedBlocks: relatedResults.reduce((sum, file) => sum + file.blocksHit, 0),\n    generalBlocks: generalResults.reduce((sum, file) => sum + file.blocksHit, 0),");
c=c.replace("    caps: { normalBlocks, assocBlocks, strongBlocks, normalSnippet, assocSnippet, strongSnippet },","    caps: { normalBlocks, assocBlocks, strongBlocks, normalSnippet, assocSnippet, strongSnippet, fallbackLimit },");
fs.writeFileSync(p,c,"utf8");
console.log("results fallback caps");
