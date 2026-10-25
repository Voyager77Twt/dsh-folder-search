import fs from "node:fs";
const p="lib/search.js";
let c=fs.readFileSync(p,"utf8");
if(!c.includes("function nearestQuestion")){
  c=c.replace("function markdownLink(label, target) {", `function matchOffset(text, terms, caseSensitive) {
  const hay = caseSensitive ? text : text.toLowerCase();
  let best = -1;
  for (const term of terms) {
    const at = hay.indexOf(caseSensitive ? term : term.toLowerCase());
    if (at >= 0 && (best < 0 || at < best)) best = at;
  }
  return best;
}

function nearestQuestion(entry, loc, offset) {
  const questions = Array.isArray(entry?.questions) ? entry.questions : [];
  const orderOf = (question) => (loc.k === 'docx' ? question.loc.p : loc.k === 'pdf' ? question.loc.page : question.loc.slide);
  let best = null;
  for (const question of questions) {
    if (!question?.loc || question.loc.k !== loc.k) continue;
    const at = Number(question.at ?? 0);
    let before = false;
    if (loc.k === 'docx') before = question.loc.p < loc.p || (question.loc.p === loc.p && at <= offset);
    else if (loc.k === 'pdf') before = question.loc.page === loc.page && at <= offset;
    else if (loc.k === 'pptx') before = question.loc.slide === loc.slide && at <= offset;
    if (!before) continue;
    if (!best) { best = question; continue; }
    const delta = orderOf(question) - orderOf(best);
    if (delta > 0 || (delta === 0 && at >= Number(best.at ?? 0))) best = question;
  }
  return best;
}

function markdownLink(label, target) {`);
  c=c.replace(`      blocks.push({
        loc,
        label: locationLabel(loc),`, `      const offset = matchOffset(text, terms, caseSensitive);
      const question = nearestQuestion(doc.entry, loc, offset < 0 ? 0 : offset);
      const baseLabel = locationLabel(loc);
      blocks.push({
        loc,
        label: question ? \`\${baseLabel} · 题号 \${question.no}（文中编号）\` : baseLabel,
        question: question?.no ?? null,`);
  fs.writeFileSync(p,c,"utf8");
  console.log("question labels added");
}else{console.log("already");}
