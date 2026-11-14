import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("import { GENERAL_ASSOCIATIONS, SUBJECT_ASSOCIATIONS } from './subject-dictionaries.js';","import { GENERAL_ASSOCIATIONS, SUBJECT_ASSOCIATIONS, SUBJECT_GATE_SUFFIXES } from './subject-dictionaries.js';");
const old="    const suffixList = (Array.isArray(settings.strongGateSuffixes) ? settings.strongGateSuffixes : String(settings.strongGateSuffixes ?? '题目,试题,领域,行业,产业').split(/[,，\\n]/)).map((suffix) => String(suffix).trim()).filter(Boolean);\n    const domainWord = (term) => suffixList.some((suffix) => term.endsWith(suffix));";
const neu="    const baseSuffixes = (Array.isArray(settings.strongGateSuffixes) ? settings.strongGateSuffixes : String(settings.strongGateSuffixes ?? '题目,试题,领域,行业,产业').split(/[,，\\n]/)).map((suffix) => String(suffix).trim()).filter(Boolean);\n    const subjectSuffixes = subject ? (SUBJECT_GATE_SUFFIXES[subject] || []) : [];\n    const suffixList = [...new Set([...baseSuffixes, ...subjectSuffixes])];\n    const domainWord = (term) => suffixList.some((suffix) => term.endsWith(suffix));";
if(!c.includes(old)) throw new Error('suffix block marker missing');
c=c.replace(old,neu);
fs.writeFileSync(p,c,"utf8");
console.log("subject suffix wiring");
