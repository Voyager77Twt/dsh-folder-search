import fs from "node:fs";
let p="lib/index.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  const finalMax = settings.finalMaxFiles ?? 'all';\n  const finalLimit = finalMax === 'all' ? Infinity : Math.max(1, Math.min(Number(finalMax), 5000));","  const finalMax = results.some((result) => result.listAll) ? 'all' : (settings.finalMaxFiles ?? 'all');\n  const finalLimit = finalMax === 'all' ? 5000 : Math.max(1, Math.min(Number(finalMax), 5000));");
fs.writeFileSync(p,c,"utf8");
console.log("merge listAll");
