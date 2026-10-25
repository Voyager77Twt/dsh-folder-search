import { extractFile } from "../lib/extract.js";
for(const [rel,ext] of [["化学/2024模拟卷.docx",".docx"],["化学/课件.pptx",".pptx"],["化学/实验数据.xlsx",".xlsx"]]){
  try{ const r=await extractFile("D:/AI/work/kw-search-mode/fixtures/library/"+rel,ext,{maxFileMB:60}); console.log(rel,"blocks="+r.blocks.length,"chars="+r.chars,"q="+r.questions.length); }
  catch(e){ console.log(rel,"ERR",e.message); }
}
