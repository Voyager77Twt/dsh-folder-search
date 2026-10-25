import fs from "node:fs";
const p="README.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("- 版本：`0.1.0`","- 版本：`0.2.0`");
c=c.replace(`| \`library_export\` | 生成 .docx 试卷到工作区「组卷」文件夹 |`,
`| \`library_export\` | 生成 .docx 试卷到工作区「组卷」文件夹 |
| \`library_index\` | 批量建索引：旧版 .doc/.rtf 先整批转换，再循环抽取；受 maxMinutes 限制，可多次调用 |
| \`library_index_export\` | 把文本索引导出成 zip，发给别人 |
| \`library_index_import\` | 导入别人的索引包，按本地 mtime/大小 校验，删除不匹配项 |`);
c=c.replace(`模式预设里另有 \`ask_user_question\`、\`todo_write\`、\`present\`，以及压缩安全网。`,
`模式预设里另有 \`ask_user_question\`、\`todo_write\`、\`present\`，以及压缩安全网。

### 索引包分享

\`\`\`text
library_index_export { library: "D:\\题库", output: "D:\\索引包.zip" }
→ 把 zip 发给别人
library_index_import { library: "D:\\对方的题库", package: "D:\\索引包.zip", dryRun: true }
→ 先看保留/丢弃数量
library_index_import { library: "D:\\对方的题库", package: "D:\\索引包.zip", verify: "mtime" }
\`\`\`

- 默认按「大小 + 修改时间」校验；文件是复制/下载来的、时间对不上时可用 \`verify: "size"\`。
- 不匹配（缺失或改动过）的条目直接丢弃，对应文件会留待后续补索引；不会误用旧文本。
- 导入是替换式：本地原有缓存会被索引包中通过校验的条目替换。`);
c=c.replace("scripts/word-to-pdf.ps1\nscripts/ppt-to-pdf.ps1","scripts/word-to-pdf.ps1\nscripts/ppt-to-pdf.ps1\nscripts/word-batch-to-pdf.ps1");
fs.writeFileSync(p,c,"utf8");
console.log("readme updated");
