import fs from "node:fs";
let p="lib/extract.js"; let c=fs.readFileSync(p,"utf8");
const regexLine="const QUESTION_RE = /^\\s*(?:(?:第\\s*)?(\\d{1,3})\\s*[.、．)）](?!\\d)|(?:第\\s*)?(\\d{1,3})\\s*题|(?:Question|Q)\\s*[.:：]?\\s*(\\d{1,3})(?!\\d))/i;";
if(!/^const QUESTION_RE = .*;$/m.test(c)) throw new Error('QUESTION_RE line missing');
c=c.replace(/^const QUESTION_RE = .*;$/m,regexLine);
c=c.replace("      out.questions.push({ no: match[1], loc: block.loc, line: i + 1, at: start, preview: line.slice(0, 60) });","      out.questions.push({ no: match[1] || match[2] || match[3], loc: block.loc, line: i + 1, at: start, preview: line.slice(0, 60) });");
fs.writeFileSync(p,c,"utf8");
console.log("question regex");
