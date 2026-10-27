# 本地文件夹检索模式（实验）

给 DSH 新建会话增加一个「本地文件夹检索模式」：在本地 Word / PDF / PPT / Excel 文件夹里按关键词找内容，回答**哪些文件、哪些位置**有命中；也可以把库里的题组一套新卷。

- 包名：`dsh-folder-search`
- 版本：`0.5.27`
- 作者：七七（Voyager77Twt）
- 许可：MIT
- 兼容：DSH `>= 0.2.0-rc.2`，Node `>= 22.19`
- `.doc` / `.ppt` / `.rtf` 转换需要 Windows + 本机 Office

解析与检索都在插件内部完成，**只把命中片段和位置送进模型上下文**，不把整份文件塞给模型。

---

## 1. 安装

### 方式一：从 GitHub 安装

先在 DSH 里装好本仓库：

```text
请用 plugin_manager 的 install_bundle 安装这个 DSH 插件：
github:Voyager77Twt/dsh-folder-search
安装完成后确认 list_plugins 里出现 dsh-folder-search，
并告诉我怎么新建会话选择「本地文件夹检索模式」。
```

固定版本：

```text
github:Voyager77Twt/dsh-folder-search#v0.5.27
```

> 仓库是私有时，运行 DSH 的机器必须已登录对应 GitHub 账号，或使用可访问该仓库的 token。

### 方式二：安装 tgz

把 `dsh-folder-search-0.5.27.tgz` 发给对方，然后：

```text
我发给你一个 DSH 插件包：<tgz 的绝对路径>。
请用 plugin_manager 的 install_bundle 安装它（target 用 file:<绝对路径>）。
装好后确认 list_plugins 里有 dsh-folder-search，
并告诉我怎么新建会话选择「本地文件夹检索模式」。
```

### 方式三：本地目录（开发调试）

```text
plugin_manager install_bundle  target: D:\path\to\dsh-folder-search
```

安装需要 Full access / 用户批准。装好后：

1. 新建会话 → 模式选「本地文件夹检索模式」；
2. 打开 设置 → **本地搜索设置** → 「数据库与索引库位置」，填写题库的绝对路径并保存；
3. 保存后会自动开始建索引，可在同页「索引库状态」查看进度；
4. 旧配置仍可在插件配置里写 `libraries`，但设置页的题库位置优先：

```yaml
- id: library-search-tools
  name: dsh-folder-search
  config:
    libraries: ['D:\你的题库']
```

卸载：插件管理里移除 `dsh-folder-search`，不会动题库文件。

---

## 2. 使用

1. 新建会话，模式选「本地文件夹检索模式」；
2. 给出文件夹绝对路径，例如 `D:\题库\化学`；
3. 直接问：

```text
搜索「侯氏制碱法」相关的题目，给文件和位置。
```

第一次检索会在后台建文本缓存；大库分批建，输出会提示还剩多少。设置页在 DSH 设置 → **本地搜索设置**（排在插件市场后面，order 50）。修改题库/索引路径并保存会触发自动迁移和建库；只改输出设置不会重建索引。

---

## 3. 数据库与索引库位置

设置页「数据库与索引库位置」：

- **题库位置**：本地题库/文件夹的绝对路径；
- **索引库位置**：文本缓存目录，留空使用 `%LOCALAPPDATA%\dsh-library-search`。

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

路径变化时：

- 修改**题库位置**：新位置会重新建库；
- 修改**索引库位置**：先自动迁移旧索引，复制成功后再删除旧目录；
- 目标位置已有同名 `lib-*` 时跳过，保留旧目录；
- 建库由设置页「索引库状态」控制，可点「开始/继续建库」。

旧版 `.doc/.rtf` 会先用一个 Word 会话批量转 PDF，再并行抽取；`.docx/.pdf/.xlsx` 等按「建库并发数」并行。

建库时的单文件回退：

1. 批量转换；
2. 批量失败 → 逐文件单独转换；
3. 单文件也失败才标记失败；
4. 建库 sync 会重试之前失败的条目（`retryErrors`），不会因为 mtime 没变就永远跳过。

索引状态接口：`/api/dsh-folder-search/index`（GET 查进度，POST `action=build` 开始/继续）。

## 4. 设置页说明

### 3.1 原词、自动扩展、强关联

检索结果分三类，各自使用自己的输出上限：

| 类型 | 怎么产生 | 使用哪组上限 |
|---|---|---|
| 直接命中原词 | 用户原词在文件中出现 | 原词检索·输出文件数 / 每文件位置数 / 片段长度 |
| 自动扩展命中 | 内置词表或自定义词表把关键词扩成关联词 | 自动扩展输出 |
| 仅强关联命中 | 只命中了强关联词，没有原词 | 强关联输出 |

同一文件如果既命中原文又命中扩展词，按“直接命中”处理。

### 3.2 搜索步骤

一次工具调用内按顺序执行：

| 步骤 | 执行次数 | 作用 |
|---|---|---|
| 1. 自动补索引 | 1 次（可关） | 搜索前检查题库更新并补缓存；关后只用旧缓存 |
| 2. 原词检索 | 1 次（必开） | 用用户原词搜索 |
| 3. 强关联词 | 1 次，与第 2 步合并 | 模型自检后填 1 个专名（人物 / 旧称 / 别名 / 缩写）；工具做广度闸门 |
| 4. 自动关联词扩展 | 1 次，与第 2 步合并 | 内置词表 + 自定义词表；自定义词优先 |
| 5. 一般关联词 | 1 次，与第 2 步合并 | 模型补充的一般关联词；不新增文件，只补已命中文件 |
| 6. 匹配范围 | 1 次 | 同文件 / 同段页 |
| 7. 显示片段 | 1 次 | 关后只给文件和位置 |
| 8. 显示题号 | 1 次 | 标“题号 N（文中编号）” |
| 9. 合并重复文件 | 1 次 | 合并内容完全相同的文件 |
| 10. 降级后重复搜索 | 0–5 次（可关） | 强关联词被降级时用剩余强关联词再搜，仍在本工具调用内 |

最低花费：只保留步骤 1–2。要更全再逐步打开 3、4、5。

### 3.3 强关联词闸门

默认规则（可在设置里改）：

- 强关联词单独命中文件数超过**直接命中文件数的 2 倍**；
- 或超过**全库 20%**；
- 或以领域词结尾（工业 / 产业 / 行业 / 领域 / 技术 / 方法 / 工艺 / 生产 / 应用 / 研究 / 化学 / 反应 / 原理 / 实验 / 流程 / 装置 / 设备 / 材料 / 物质 / 题目 / 试题）；
- 任一成立 → 降级；只保留最窄的 1 个强关联词；
- 降级词不再带入新文件，已命中原词的文件保留；
- 结果顶部注明降级词。

可选判定模式：`factor`（直接命中倍数）、`files`（固定文件数）、`ratio`（全库占比）、`domain`（领域词）、`all`（以上任一，默认）。

### 3.4 最终输出

「最终输出文件数」默认**全部**。有上限时按顺序保留：

```text
直接命中 → 自动扩展命中 → 仅强关联命中
```

例如直接命中 100 个、关联词 18 个、最终输出 75：输出前 75 个直接命中，关联词不再输出。

### 3.5 自定义词表

设置页第 4 步下方：

```text
关键词=关联词1,关联词2
```

- 同一个关键词：**自定义词优先**，剩余名额用内置词表补齐；
- 与内置词表共用「关联词数量上限」和「自动扩展输出」；
- 与当前关键词无关的自定义条目不会参与检索，无需手动关闭。

### 3.6 默认值速查

| 设置 | 默认 |
|---|---|
| 原词检索·输出文件数 / 每文件位置数 / 片段长度 | 全部 / 4 / 90 |
| 自动词表扩展 | 开 |
| 关联词数量上限 | 4 |
| 自动扩展输出·文件数 / 位置数 / 片段长度 | 全部 / 2 / 45 |
| 强关联词 | 开 |
| 强关联词上限 | 1 |
| 强关联降级判定 | `all`（2 倍 / 20% / 领域词） |
| 强关联输出·文件数 / 位置数 / 片段长度 | 全部 / 2 / 45 |
| 一般关联词 | 开 |
| 降级后重复搜索 / 最多次数 | 关 / 1 |
| 匹配范围 | 同文件 |
| 显示片段 / 显示题号 | 开 / 开 |
| 合并重复文件 | 关 |
| 最终输出文件数 | 全部 |
| 自动补索引 | 开 |
| 建库并发数 | 3（1–8） |
| 题库位置 | 空（空时在对话里询问） |
| 索引库位置 | 空（默认 `%LOCALAPPDATA%\dsh-library-search`） |
| 目录默认文件数 | 60 |

全部设置写入：

```text
%LOCALAPPDATA%\dsh-library-search\settings.json
```

（目录名保留了旧的 `dsh-library-search`，这样已有索引和设置不会丢。）

---

## 5. 文本缓存

Word / PDF / PPT / Excel 不是纯文本。第一次检索时，插件会：

1. 把每个文档抽成按“段 / 页 / 幻灯片 / 单元格”分行的文本；
2. 每行带位置标记（如 `第 42 段`、`第 5 页`、`Sheet1!B12`）；
3. 之后所有关键词搜索用 **ripgrep 扫这些文本行**，不重新打开原文件；
4. 原文件完全不动；缓存里只有文字，没有图片、字体、排版。

缓存位置：

```text
%LOCALAPPDATA%\dsh-library-search\lib-<hash>\
```

实测文本缓存约为原文件的 **0.4%**（本机 4.5 GB 题库约 20 MB）。默认上限 250 MB，可用 `cacheCapMB` 调低；删缓存只是下次重新抽。

建库过程中旧版 `.doc` 会生成 `legacy-pdf-*` 临时 PDF，这部分**不算文本索引**，建库结束会删除；如果看到索引大小短时间变大，先看是否还有这个目录。

### 建库失败与已知不可索引文件

当前题库 1767 个文件里，1760 个已建好；剩余 7 个是：

| 文件 | 原因 |
|---|---|
| `模拟试题/2022/一模/朝阳/朝阳区第二学期高三化学质量检测一试卷.docx` | `invalid zip data`，docx 本身损坏 |
| `期末考试/2020期中期末/2020选择.docx` | `invalid zip data` |
| `期末考试/2019期末/东城期末/18题.pptx` | `invalid zip data` |
| `期末考试/2013期末/成绩/王莹.xlsx` | 文件有密码 |
| `模拟试题/2020/西城一模05/2020.5西城高三化学诊断性测试试卷.doc` | Word 批量/单文件转换均失败 |
| `模拟试题/2013/2013房山高三一模化学试题.doc` | 同上 |
| `模拟试题/2010一模/通州区高三年级模拟考试（一）.doc` | 同上 |

损坏的 zip、加密 Excel 无法靠重试修复；3 个 `.doc` 已经尝试过单文件 Word 转换，仍然失败，通常是文件损坏或本机 Word 打不开。修复这些文件后，重新建库即可补上。

### 缓存会不会导致搜索不全？

缓存本身不会丢命中：它是抽取文本的完整副本，检索时逐行扫描，没有采样、摘要或截断。

| 对照 | 样本 | 结果 |
|---|---|---|
| 缓存检索 vs 每次直接解析原文件 | `2019年` 70 个文件，3 个关键词 | 命中文件集合完全一致，missing=0 |
| 缓存检索 vs Word 自身文本 | 20 个 `.docx`，3 个关键词 | missing=0，extra=0 |

仍可能搜不全的情况：

- 索引还没建完（会提示还剩多少）；
- Word 页眉 / 页脚 / 脚注 / 公式、PPT 备注、Excel 公式与批注、扫描 PDF 的图片文字；
- 压缩包 / 图片 / 视频只索引文件名；
- 单文件/单次扫描的极端上限；
- 缓存上限到了；
- 文件改动但 mtime 与大小都没变（可用 `refresh: "force"` 重建）。

---

## 6. 支持范围与工具

| 类型 | 支持 |
|---|---|
| `.docx` | 全文（段落 + 标题路径） |
| `.pdf` | 全文（页码；扫描件无文本会标注） |
| `.doc` / `.rtf` | 本机 Word 转 PDF 后全文 |
| `.pptx` | 全文（第 N 张） |
| `.ppt` | 本机 PowerPoint 转 PDF 后全文 |
| `.xlsx` / `.xls` | 单元格文本（`Sheet!B12`） |
| `.txt` / `.md` / `.csv` | 逐行 |
| `.rar` / `.zip` / 图片 / 视频 | 仅文件名 |

工具：

| 工具 | 用途 |
|---|---|
| `library_search` | 关键词检索；返回文件、位置、片段、三类统计 |
| `library_outline` | 目录、大题/题号位置 |
| `library_read` | 读完整题目（可用 `question` 限定） |
| `library_export` | 组卷并导出 `.docx` |
| `library_status` | 绑题库路径、检查索引状态 |
| `library_index` | 批量建索引 |
| `library_index_export` | 导索引包 zip |
| `library_index_import` | 导入索引包，按大小/时间校验 |

---

## 7. 发布到 GitHub

### 6.1 发布前检查

1. 确认没有把题库、缓存、token 写进仓库；
2. `.gitignore` 已排除：

```text
node_modules/
fixtures/
*.tgz
.cache/
*.log
```

3. 把 `package.json` 里的占位地址换成真实仓库：

```json
"repository": { "type": "git", "url": "https://github.com/Voyager77Twt/dsh-folder-search.git" },
"homepage": "https://github.com/Voyager77Twt/dsh-folder-search#readme",
"bugs": { "url": "https://github.com/Voyager77Twt/dsh-folder-search/issues" }
```

4. 跑一次静态检查：

```bash
node tests/_static-audit.mjs
```

看到 `"ok": true` 再发布。

### 6.2 在 GitHub 新建仓库

打开 <https://github.com/new>：

- Repository name：`dsh-folder-search`
- 选择 Public 或 Private
- **不要**勾选 “Add a README / .gitignore / license”，本地已经有了

### 6.3 本地初始化并推送

在 `D:\AI\work\kw-search-mode` 打开 PowerShell：

```powershell
git init
git add .
git status --short        # 确认 fixtures/、*.tgz、node_modules/ 没有被加入
git commit -m "feat: dsh-folder-search 0.5.27"
git branch -M main
git remote add origin https://github.com/Voyager77Twt/dsh-folder-search.git
git push -u origin main
```

如果远程已经初始化过，可改用：

```powershell
git remote add origin https://github.com/Voyager77Twt/dsh-folder-search.git
git push -u origin main
```

认证二选一：

- HTTPS：用 GitHub Personal Access Token 当密码；
- SSH：

```powershell
git remote set-url origin git@github.com:Voyager77Twt/dsh-folder-search.git
```

已安装 GitHub CLI 也可以：

```powershell
gh auth login
gh repo create dsh-folder-search --public --source . --remote origin --push
```

### 6.4 发 Release

```powershell
git tag v0.5.27
git push origin v0.5.27
```

然后 GitHub 仓库 → Releases → Draft a new release：

- Tag：`v0.5.27`
- 标题：`dsh-folder-search 0.5.27`
- 附件：上传 `dsh-folder-search-0.5.27.tgz`
- 说明：写本次改动和安装命令

发布后别人可以：

```text
github:Voyager77Twt/dsh-folder-search
```

或下载 Release 里的 tgz 安装。

### 6.5 以后更新

```powershell
# 改代码
node tests/_static-audit.mjs
pnpm pack

git add .
git commit -m "fix: ..."
git tag v0.5.27
git push origin main
git push origin v0.5.27
```

再到 Releases 上传新的 tgz。

---

## 8. 限制

- 扫描 PDF、图片文字不索引；
- Word 的页眉/页脚/脚注、公式对象、PPT 备注、Excel 公式/批注不抽取；
- `.doc` / `.ppt` 转换依赖本机 Office，可能较慢；
- 去重只比较已显示的前几条 block，Word/PDF 跨格式副本通常不会互相合并；
- 强关联词闸门是启发式规则，不能保证模型一定想到正确专名；
- 组卷是实验功能，导出前要自己核对题目和答案。

---

## 9. 开发

```powershell
node tests/_static-audit.mjs   # 语法、清单、设置键、路由、分类/上限
pnpm pack                      # 生成 dsh-folder-search-<version>.tgz
```

目录：

```text
lib/index.js         工具注册、配置
lib/search.js        检索、分类、强关联闸门、渲染
lib/indexer.js       增量索引、缓存
lib/extract.js       docx/pdf/pptx/xlsx/文本抽取
lib/outline.js       目录
lib/docx-writer.js   组卷导出
lib/client.js        设置页
lib/settings-store.js 设置默认值与持久化
lib/settings-host.js 设置接口
cordis.patch.yml     模式预设
```
