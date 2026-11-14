import fs from "node:fs";
let p="tests/_static-audit.mjs"; let c=fs.readFileSync(p,"utf8");
c=c.replace("const baseArgs = { keywords: [\"侯氏制碱法\"], strongTerms: [\"侯德榜\"], generalTerms: [\"联合制碱\", \"索尔维\", \"碳酸钠\"], refresh: \"never\" };","const baseArgs = { keywords: [\"侯氏制碱法\"], strongTerms: [\"侯德榜\"], generalTerms: [\"联合制碱\", \"索尔维\", \"碳酸钠\"], refresh: \"never\", all: true };");
c=c.replace("{ ...settings, dedupe, searchMode: 'custom', all: true }","{ ...settings, dedupe, searchMode: 'custom' }");
fs.writeFileSync(p,c,"utf8");
console.log("base args all");
