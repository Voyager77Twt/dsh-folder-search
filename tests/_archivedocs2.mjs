import fs from "node:fs";
let p="README.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("| `.rar` / `.zip` / 图片 / 视频 | 仅文件名 |","| `.zip` | 解压后索引其中的 docx/pdf/pptx/xlsx/txt 等支持格式；临时文件建库后删除，链接指回原 zip |\n| `.rar` / `.7z` / 图片 / 视频 | 仅文件名 |");
const marker="### 额外防护";
const section = [
'### ZIP 压缩包',
'',
'`.zip` 会被安全解压到随机临时目录，只抽取其中支持的文档格式，文本写入索引缓存，临时文件在 finally 中删除。',
'',
'- 搜索结果链接仍指向原 `.zip`；',
'- 位置标签显示成员路径，例如“压缩包：folder/a.docx · 第 12 段”；',
'- 嵌套 zip 受最大深度和全树条目/体积预算限制；',
'- 损坏或加密成员跳过，不影响其他成员；',
'- `.rar` / `.7z` 仍只记文件名。',
'',
'### 额外防护'
].join('\n');
if(!c.includes(marker)) throw new Error('extra marker'); c=c.replace(marker,section);
c=c.replace("| ZIP 最大条目数 | 5000 | 单个 docx/pptx/xlsx 内部压缩包允许的条目数 |","| ZIP 最大条目数 | 5000 | 一个 Office 文件或 .zip 压缩包允许的条目数 |");
c=c.replace("| 抽取文本上限（MB） | 20 | 单文件最多保留的文本字符量，超出部分截断 |","| 抽取文本上限（MB） | 20 | 单文件最多保留的文本字符量，超出部分截断 |\n| 压缩包最大深度 | 2 | 最多递归解压多少层；更深层跳过 |\n| 嵌套树最大条目数 | 10000 | 压缩包及所有嵌套包合计条目上限 |\n| 嵌套树总解压上限（MB） | 1024 | 压缩包及所有嵌套包合计解压体积上限 |");
fs.writeFileSync(p,c,"utf8");
console.log("Chinese archive docs");
