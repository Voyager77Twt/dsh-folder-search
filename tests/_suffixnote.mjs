import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
const zh="这里编辑第一层通用后缀；模型选择 subject 时自动追加该学科后缀。学科后缀只影响强关联降级，不会进入扩展词表。";
c=c.replace("每行或逗号一个；留空关闭领域词降级。默认/全面/自定义模式都使用。默认只保留通用元词，化学或其他学科可自行追加。",zh);
// Add English translation for the new note by editing EN object JSON
const start=c.indexOf("    const EN = "); const end=c.indexOf("\n    const isEnglish",start);
const raw=c.slice(start+"    const EN = ".length,end).trim().replace(/;$/,''); const en=JSON.parse(raw);
en[zh]="Edit the base suffixes here. Choosing a subject automatically adds that subject's suffixes for strong-term demotion only; they never enter the expansion dictionaries.";
c=c.slice(0,start)+"    const EN = "+JSON.stringify(en,null,2)+";"+c.slice(end);
fs.writeFileSync(p,c,"utf8");
let y=fs.readFileSync("cordis.patch.yml","utf8");
y=y.replace("可选 subject：题目明显属于语文/数学/英语/物理/化学/生物/历史/地理/政治时选一个，不确定就省略；不要硬选。","可选 subject：题目明显属于语文/数学/英语/物理/化学/生物/历史/地理/政治时选一个，不确定就省略；不要硬选。subject 会同时激活该学科的扩展词和强关联领域词后缀；后者只用于降级，不参与扩词。");
fs.writeFileSync("cordis.patch.yml",y,"utf8");
console.log("suffix note/prompt");
