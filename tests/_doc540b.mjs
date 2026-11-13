import fs from "node:fs";
let p="README.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("- 版本：`0.5.39`","- 版本：`0.5.40`");
const security = [
'## 安全',
'',
'设置页最后有独立的「安全」卡片。默认值偏保守，修改后对**新抽取/重新抽取**的文件生效；已经成功缓存的文档不会自动重抽。',
'',
'| 设置 | 默认 | 作用 |',
'|---|---:|---|',
'| ZIP 最大条目数 | 5000 | 单个 docx/pptx/xlsx 内部压缩包允许的条目数 |',
'| 单条目解压上限（MB） | 64 | 任一压缩条目解压后的最大体积 |',
'| 总解压上限（MB） | 512 | 整个压缩包解压后的总上限 |',
'| 压缩比上限 | 200 | 解压总大小相对压缩文件的倍数上限 |',
'| 抽取文本上限（MB） | 20 | 单文件最多保留的文本字符量 |',
'| 解析隔离 | 开 | 每个文件在独立 worker 中解析；解析器崩溃/OOM 不拖垮 DSH |',
'| 解析 worker 内存上限（MB） | 256 | worker 的 V8 老生代上限，不是宿主进程的绝对上限 |',
'| 允许 Office 宏 | 关 | 默认强制禁用 Word/PowerPoint 宏和打开时外部链接更新；只有确认题库可信才建议打开 |',
'',
'额外防护：',
'',
'- 拒绝 docx/pptx XML 中的 DOCTYPE / ENTITY 声明；',
'- 旧版 Office 转换默认设置 AutomationSecurity=3，只读打开，禁止打开时更新链接；',
'- 解析在 worker 中进行，限制老生代内存，超时/异常只让当前文件失败。',
'',
'仍存在的边界：',
'',
'- xlsx 使用 SheetJS 0.18.5；npm 上没有更新的修复版本，主要靠 worker 隔离和 ZIP/文本限制降低影响；',
'- PDF 解析器漏洞、Office 自身漏洞无法由插件完全消除；',
'- 恶意文档的 prompt injection 不会被执行，但可能影响模型判断，文档内容仍应视为不可信数据；',
'- 临时目录使用随机目录，正常使用下覆盖风险低；P2 的独占创建和符号链接检查尚未实现。',
'',
'---',
'',
'## 限制'
].join('\n');
c=c.replace("## 限制",security);
fs.writeFileSync(p,c,"utf8");
let t=fs.readFileSync("tests/_static-audit.mjs","utf8");
t=t.replace('ok(pkg.version === "0.5.39", "package.version 0.5.39");','ok(pkg.version === "0.5.40", "package.version 0.5.40");');
t=t.replace('ok(keys.length === 35, "35 settings keys, got " + keys.length);','ok(keys.length === 43, "43 settings keys, got " + keys.length);');
fs.writeFileSync("tests/_static-audit.mjs",t,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.40"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
console.log("0.5.40 docs fixed");
