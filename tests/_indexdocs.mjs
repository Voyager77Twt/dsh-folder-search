import fs from "node:fs";
let r=fs.readFileSync("README.md","utf8");
r=r.replace("- 版本：`0.5.20`","- 版本：`0.5.21`");
r=r.replace("## 3. 设置页说明", `## 3. 数据库与索引库位置

设置页「数据库与索引库位置」：

- **题库位置**：本地题库/文件夹的绝对路径；
- **索引库位置**：文本缓存目录，留空使用 \`%LOCALAPPDATA%\\dsh-library-search\`。

保存设置后：

1. 如果题库或索引库路径发生变化，插件自动开始建索引；
2. 索引在后台分批进行，不阻塞设置页；
3. 设置页「索引库状态」显示：
   - 索引大小；
   - 已索引 / 总文件数；
   - 待建、失败数量；
   - 进度条和建库中状态；
   - 索引目录。

第一次填写路径并保存就会开始建库；已有缓存时只补新增/改动文件。

## 4. 设置页说明`);
r=r.replace("## 4. 文本缓存","## 5. 文本缓存");
r=r.replace("## 5. 支持范围与工具","## 6. 支持范围与工具");
r=r.replace("## 6. 发布到 GitHub","## 7. 发布到 GitHub");
r=r.replace("## 7. 限制","## 8. 限制");
r=r.replace("## 8. 开发","## 9. 开发");
fs.writeFileSync("README.md",r,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.21"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
let t=fs.readFileSync("tests/_static-audit.mjs","utf8").replace('"package.version 0.5.20"','"package.version 0.5.21"').replace('pkg.version === "0.5.20"','pkg.version === "0.5.21"');
fs.writeFileSync("tests/_static-audit.mjs",t,"utf8");
console.log("0.5.21 docs");
