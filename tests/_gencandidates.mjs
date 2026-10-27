import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
// gate threshold: factor/ratio only when direct > 5
c=c.replace("    const isBroad = (term, count) => {\n      const overFactor = directFiles > 0 && count > directFiles * factor;\n      const overFiles = count > maxFiles;\n      const overRatio = (count / totalDocs) * 100 > maxRatio;","    const gateActive = directFiles > 5;\n    const isBroad = (term, count) => {\n      const overFactor = gateActive && count > directFiles * factor;\n      const overFiles = count > maxFiles;\n      const overRatio = gateActive && (count / totalDocs) * 100 > maxRatio;");
// block mode keep general candidate blocks
c=c.replace("      const keep = blocks.filter((block) => (match === 'all' ? block.keywords.length === keywords.length : block.keywords.length > 0));","      const keep = blocks.filter((block) => (match === 'all' ? block.keywords.length === keywords.length : block.keywords.length > 0 || (fileKeywords.size === 0 && fileStrong.size === 0 && (block.related?.length ?? 0) > 0)));");
// coverage include general candidate
c=c.replace("    const covered = match === 'all' ? fileKeywords.size === keywords.length : fileKeywords.size > 0 || fileStrong.size > 0;\n    if (matchScope === 'block') {\n      if (!blocks.length) continue;\n    } else if (!covered) {\n      continue;\n    }","    const covered = match === 'all' ? fileKeywords.size === keywords.length : fileKeywords.size > 0 || fileStrong.size > 0;\n    const generalCandidate = fileKeywords.size === 0 && fileStrong.size === 0 && fileGeneral.size > 0;\n    if (matchScope === 'block') {\n      if (!blocks.length) continue;\n    } else if (!covered && !generalCandidate) {\n      continue;\n    }");
// category and caps
c=c.replace("    const directFile = fileDirectKeywords.size > 0;\n    const expandedFile = !directFile && fileKeywords.size > 0;\n    const blockCap = directFile ? normalBlocks : expandedFile ? assocBlocks : strongBlocks;\n    const snippetCap = directFile ? normalSnippet : expandedFile ? assocSnippet : strongSnippet;","    const directFile = fileDirectKeywords.size > 0;\n    const expandedFile = !directFile && fileKeywords.size > 0;\n    const generalFile = !directFile && !expandedFile && fileGeneral.size > 0;\n    const blockCap = directFile ? normalBlocks : expandedFile ? assocBlocks : generalFile ? assocBlocks : strongBlocks;\n    const snippetCap = directFile ? normalSnippet : expandedFile ? assocSnippet : generalFile ? assocSnippet : strongSnippet;");
c=c.replace("      expandedOnly: expandedFile,\n      related: [...fileStrong, ...fileGeneral],","      expandedOnly: expandedFile,\n      generalOnly: generalFile,\n      related: [...fileStrong, ...fileGeneral],");
c=c.replace("      relatedOnly: fileKeywords.size === 0 && fileStrong.size > 0,","      relatedOnly: !generalFile && fileKeywords.size === 0 && fileStrong.size > 0,");
// gate filter keep general files
c=c.replace("        if (!file.keywords.length && !strong.length) continue;","        if (!file.keywords.length && !strong.length && !file.generalOnly) continue;");
fs.writeFileSync(p,c,"utf8");
console.log("general candidates + gate threshold");
