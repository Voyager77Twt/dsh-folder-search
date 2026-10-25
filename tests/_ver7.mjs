import fs from "node:fs";
let p="README.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("- 版本：`0.2.5`","- 版本：`0.2.6`");
c=c.replace("| `maxFiles` / `maxBlocksPerFile` | `6` / `2` | 检索返回上限（控制回传 token） |\n| `snippetChars` | `60` | 每处片段字符数 |\n| `dedupe` | `true` | 合并命中内容相同的重复文件 |",
"| `maxFiles` / `maxBlocksPerFile` | `25` / `4` | 普通检索返回上限 |\n| `snippetChars` | `120` | 普通检索每处片段字符数 |\n| `expandMaxFiles` / `expandMaxBlocksPerFile` / `expandSnippetChars` | `8` / `2` / `60` | **只有关联词扩展生效时**的收紧上限 |\n| `dedupe` | `false` | 合并命中内容完全相同的重复文件；默认关闭 |");
fs.writeFileSync(p,c,"utf8");
p="package.json"; const pkg=JSON.parse(fs.readFileSync(p,"utf8")); pkg.version="0.2.6"; fs.writeFileSync(p,JSON.stringify(pkg,null,2)+"\n","utf8");
console.log("0.2.6");
