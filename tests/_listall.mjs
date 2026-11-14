import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  const normalLimit = normalMax === 'all' ? Infinity : Math.max(1, Math.min(Number(normalMax), 5000));\n  const assocLimit = assocMax === 'all' ? Infinity : Math.max(1, Math.min(Number(assocMax), 5000));","  const listAll = args?.all === true;\n  const normalLimit = listAll ? 5000 : normalMax === 'all' ? Infinity : Math.max(1, Math.min(Number(normalMax), 5000));\n  const assocLimit = listAll ? 5000 : assocMax === 'all' ? Infinity : Math.max(1, Math.min(Number(assocMax), 5000));");
c=c.replace("  const strongMax = settings.strongMaxFiles ?? 'all';\n  const strongLimit = strongMax === 'all' ? Infinity : Math.max(1, Math.min(Number(strongMax), 5000));","  const strongMax = settings.strongMaxFiles ?? 'all';\n  const strongLimit = listAll ? 5000 : strongMax === 'all' ? Infinity : Math.max(1, Math.min(Number(strongMax), 5000));");
c=c.replace("  const finalLimit = finalMax === 'all' ? Infinity : Math.max(1, Math.min(Number(finalMax), 5000));","  const finalLimit = listAll ? 5000 : finalMax === 'all' ? Infinity : Math.max(1, Math.min(Number(finalMax), 5000));");
c=c.replace("    truncated,\n    strongGate,","    truncated,\n    listAll,\n    strongGate,");
fs.writeFileSync(p,c,"utf8");
console.log("all flag limits");
