import fs from "node:fs";
const OLD="dsh-library-search", NEW="dsh-local-folder-library-search";
// package
let p="package.json"; let pkg=JSON.parse(fs.readFileSync(p,"utf8"));
pkg.name=NEW; pkg.version="0.5.0";
pkg.description="本地普通文件夹检索模式：在本地 Word / PDF / PPT / Excel 文件夹里按关键词检索并给出可打开的位置，读取完整题目，导出组卷 Word。";
pkg.repository.url=`https://github.com/your-github-name/${NEW}.git`;
pkg.homepage=`https://github.com/your-github-name/${NEW}#readme`;
pkg.bugs.url=`https://github.com/your-github-name/${NEW}/issues`;
fs.writeFileSync(p,JSON.stringify(pkg,null,2)+"\n","utf8");
// patch
p="cordis.patch.yml"; let y=fs.readFileSync(p,"utf8");
y=y.replaceAll("dsh-library-search",NEW);
y=y.replace("id: library-search\n","id: local-folder-search\n");
y=y.replace("name: 文件库检索模式","name: 本地普通文件夹检索模式");
y=y.replace("description: 只做两件事：在题库文件夹","description: 只做两件事：在本地普通文件夹（题库）");
y=y.replace("你是「文件库检索模式」的助手","你是「本地普通文件夹检索模式」的助手");
y=y.replace("library-search-settings-host","local-folder-library-search-settings-host");
fs.writeFileSync(p,y,"utf8");
// client
p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("id: 'dsh-library-search'","id: 'dsh-local-folder-library-search'");
c=c.replace("const API = '/api/dsh-library-search/settings';","const API = '/api/dsh-local-folder-library-search/settings';");
c=c.replace("id: 'library-search'","id: 'local-folder-search'");
fs.writeFileSync(p,c,"utf8");
// host route
p="lib/settings-host.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("const ROUTE = '/api/dsh-library-search/settings';","const ROUTE = '/api/dsh-local-folder-library-search/settings';");
fs.writeFileSync(p,c,"utf8");
// plugin names
p="lib/index.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("export const name = 'library-search';","export const name = 'local-folder-search';");
fs.writeFileSync(p,c,"utf8");
p="lib/settings-host.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("export const name = 'library-search-settings';","export const name = 'local-folder-library-search-settings';");
fs.writeFileSync(p,c,"utf8");
// README targeted
p="README.md"; c=fs.readFileSync(p,"utf8");
c=c.replace("# 文件库检索模式（实验）— `dsh-library-search`","# 本地普通文件夹检索模式（实验）— `dsh-local-folder-library-search`");
c=c.replaceAll("dsh-library-search-0.4.5.tgz","dsh-local-folder-library-search-0.5.0.tgz");
c=c.replaceAll("dsh-library-search","dsh-local-folder-library-search");
c=c.replaceAll("文件库检索模式","本地普通文件夹检索模式");
c=c.replace("- 版本：`0.4.5`","- 版本：`0.5.0`");
fs.writeFileSync(p,c,"utf8");
console.log("renamed to",NEW);
