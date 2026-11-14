import { QUESTION_RE, detectStructure } from "../lib/extract.js";
for (const line of ["第1题 题干", "1. 题干", "Question 12: 题干", "Q1 题干", "Q.3 题干", "Q 4 题干", "Q10 题干", "(1) 小问"]) {
 const m=line.match(QUESTION_RE); const out={sections:[],questions:[]}; detectStructure({text:line,loc:{}},out);
 console.log(line, m ? (m[1]||m[2]||m[3]) : null, out.questions[0]?.no || null);
}
