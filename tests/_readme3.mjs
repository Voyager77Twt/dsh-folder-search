import fs from "node:fs";
const p="README.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("- 版本：`0.2.0`","- 版本：`0.2.1`");
c=c.replace("| `library_export` | 生成 .docx 试卷到工作区「组卷」文件夹 |","| `library_export` | 生成 .docx 试卷到工作区「组卷」文件夹 |\n| `library_status` | 绑题库路径并检查本地索引：是否已链接、匹配/需更新/失败各多少；`repair=true` 可顺带补索引 |");
c=c.replace("- **题号**：`library_outline` 会列出「题号 → 第几页/第几段」，但检索结果**不自动附题号**——很多资料是汇编卷，题号会在同一文件里重新开始，自动关联反而会误标。检索结果以「文件 + 段落/页 + 原文片段」为准；要某道题的完整内容时用 `library_read`（可带 `question`）。",
"- **题号**：`library_outline` 列出「题号 → 第几页/第几段」；检索结果会在位置后标「题号 N（文中编号）」——这是文件里的编号，汇编卷可能重排，所以同时给文件和片段，以它们为准。要完整题目用 `library_read`（可带 `question`）。");
c=c.replace("`pnpm pack` 产物约 29 KB","`pnpm pack` 产物约 34 KB");
fs.writeFileSync(p,c,"utf8");
console.log("readme 0.2.1");
