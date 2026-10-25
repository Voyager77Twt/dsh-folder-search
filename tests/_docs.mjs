import fs from "node:fs";
let p="README.md"; let c=fs.readFileSync(p,"utf8");
const anchor = "|`rgPath`|自动|ripgrep 路径，默认用 DSH 自带|\n";
const table = `|`rgPath`|自动|ripgrep 路径，默认用 DSH 自带|

### 本地搜索设置页的每一项

| 设置项 | 默认 | 影响 |
|---|---|---|
| 普通·输出文件数 | 全部 | 普通关键词一次列多少文件；“全部”最全也最贵 |
| 普通·每文件位置数 | 4 | 每个文件最多列几处命中；总数仍显示 |
| 普通·片段长度 | 90 | 关键词前后截取多少字 |
| 自动关联词扩展（词表） | 开 | 内置词表触发“有机→烃/醇/醛…”；与模型补充关联词是两套 |
| 关联词数量上限 | 4 | 每个关键词最多扩出几个词表关联词 |
| 扩展检索·最多文件数 | 8 | 仅在词表扩展触发时生效 |
| 扩展检索·每文件位置数 | 2 | 同上 |
| 扩展检索·片段长度 | 45 | 同上 |
| 强关联词上限 | 1 | 模型自己想、第一次检索就带的强关联概念数；0=禁止 |
| 一般关联词上限 | 2 | 模型补充的一般关联词数；不新增文件，只补已命中文件里的段落 |
| 自动补索引 | 开 | 检索前检查题库更新并补索引；关后只用旧缓存 |
| 匹配范围 | 同文件 | 同文件=文件里出现即可；同段/页=必须同一段/页/单元格 |
| 显示命中片段 | 开 | 关后只给文件和位置，最省 token |
| 显示题号 | 开 | 在位置后标“题号 N（文中编号）” |
| 结果去重 | 关 | 合并命中内容完全相同的文件；会少列文件 |
| 目录默认文件数 | 60 | outline 一次列多少文件，只影响目录输出 |
`;
if(!c.includes("|`rgPath`|自动|ripgrep 路径，默认用 DSH 自带|\n")) throw new Error("readme anchor missing");
c=c.replace(anchor, table);
fs.writeFileSync(p,c,"utf8");
// code comments
p="lib/settings-store.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("export const DEFAULT_SETTINGS = {", "/** 用户可在「本地搜索设置」页修改；只影响输出，不影响索引内容。 */\nexport const DEFAULT_SETTINGS = {");
fs.writeFileSync(p,c,"utf8");
p="lib/search.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("  const strongTerms =", "  // 强关联词由模型自己判断，可带来新文件；一般关联词只补充已命中文件，避免泛词爆炸。\n  const strongTerms =");
fs.writeFileSync(p,c,"utf8");
console.log("readme/comments completed");
