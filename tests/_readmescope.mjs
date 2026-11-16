import fs from "node:fs";
let p="README.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("* 需要只查某一个库时，传 `library` 参数。","* 需要只查某一个库时，传 `library` 参数。\n\n配置两个以上题库后，题库位置下方会出现「搜索范围」：\n\n* **全部库中搜索**：直接聚合所有库；\n* **搜索前询问我**：模型先询问用户选择全部库还是具体库，不会自行猜。\n\n选择「全部库」后，模型会传 `allLibraries=true`；选择具体库时传该库的 `library` 路径。");
fs.writeFileSync(p,c,"utf8");
p="README.en.md"; c=fs.readFileSync(p,"utf8");
c=c.replace("* Pass `library` to search a single library.","* Pass `library` to search a single library.\n\nWith two or more libraries, a **Search scope** selector appears below the library paths:\n\n* **Search all libraries**: aggregate every library directly;\n* **Ask before searching**: the model first asks whether to search all libraries or one specific library.\n\nAfter choosing all libraries, the model passes `allLibraries=true`; for one library it passes that library's `library` path.");
fs.writeFileSync(p,c,"utf8");
console.log("README multi-library scope");
