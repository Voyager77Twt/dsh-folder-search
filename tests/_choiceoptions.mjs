import fs from "node:fs";
let p="lib/index.js"; let c=fs.readFileSync(p,"utf8");
const old=`          return {
            needsLibraryChoice: true,
            libraries: indexes.map((entry) => entry.library),
            message: \`当前配置了多个题库，搜索范围设置为“搜索前询问我”。请先询问用户：要在全部 \${indexes.length} 个库中搜索，还是只搜索其中一个库？\\n\${indexes.map((entry) => '- ' + entry.library).join('\\n')}\`,
          };`;
const neu=`          const libraries = indexes.map((entry) => entry.library);
          return {
            needsLibraryChoice: true,
            libraries,
            choices: [{ label: '全部库', value: 'all' }, ...libraries.map((library) => ({ label: library, value: library }))],
            message: [
              \`当前配置了多个题库，搜索范围设置为“搜索前询问我”。\`,
              \`请使用 ask_user_question 让用户选择，选项必须列出全部 \${indexes.length} 个库，并包含“全部库”；不要让用户自己输入路径：\`,
              ...libraries.map((library) => '- ' + library),
            ].join('\\n'),
          };`;
if(!c.includes(old)) throw new Error('choice return marker'); c=c.replace(old,neu);
fs.writeFileSync(p,c,"utf8");
let y=fs.readFileSync("cordis.patch.yml","utf8");
const oldPrompt="- 多题库且设置页搜索范围为「搜索前询问我」时，如果 library_search 返回 needsLibraryChoice=true，必须先问用户选择全部库还是具体库；用户明确选全部后传 allLibraries=true，选具体库时传 library 绝对路径。不要自行选库或跳过这个问题。";
const newPrompt="- 多题库且设置页搜索范围为「搜索前询问我」时，如果 library_search 返回 needsLibraryChoice=true，必须调用 ask_user_question，并直接把返回的 choices 作为选项：第一项固定是“全部库”，其余每项是一个完整题库路径；不要让用户自己输入库名或路径。用户选“全部库”后传 allLibraries=true，选具体库时把该库路径传给 library。不要自行选库或跳过这个问题。";
if(!y.includes(oldPrompt)) throw new Error('prompt marker'); y=y.replace(oldPrompt,newPrompt); fs.writeFileSync("cordis.patch.yml",y,"utf8");
console.log("structured library choices");
