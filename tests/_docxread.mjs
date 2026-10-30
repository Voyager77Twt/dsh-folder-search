import fs from "node:fs";
import { unzipSync, strFromU8 } from "fflate";
const src=process.argv[2];
const zip=unzipSync(fs.readFileSync(src));
const xml=strFromU8(zip["word/document.xml"]);
let text=xml
  .replace(/<w:tab[^>]*\/>/g,"\t")
  .replace(/<w:br[^>]*\/>/g,"\n")
  .replace(/<\/w:p>/g,"\n")
  .replace(/<[^>]+>/g,"")
  .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'");
text=text.replace(/\n{3,}/g,"\n\n");
const out=process.env.TEMP+"\\docx-check.txt"; fs.writeFileSync(out,text,"utf8"); console.log(out,text.length);
