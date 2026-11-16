import fs from "node:fs";
let p="cordis.patch.yml"; let c=fs.readFileSync(p,"utf8");
c=c.replace("必须调用 ask_user_question，并直接把返回的 choices 作为选项：第一项固定是“全部库”，其余每项是一个完整题库路径；不要让用户自己输入库名或路径。","必须调用 ask_user_question，并把返回的 choices 中每一项的 label 作为选项（不要额外传 value）：第一项固定是“全部库”，其余每项是一个完整题库路径；不要让用户自己输入库名或路径。");
fs.writeFileSync(p,c,"utf8");
console.log("ask options labels");
