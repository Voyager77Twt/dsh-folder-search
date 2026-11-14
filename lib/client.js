window.__ModuleLoader__.load({
  id: 'dsh-folder-search',
  factory(require) {
    const React = require('react');
    let activeLocale = 'zh-CN';
    let localeFace = null;
    const EN = {
  "本地搜索设置": "Local Search Settings",
  "数据库与索引库位置": "Database and index location",
  "题库位置": "Library path",
  "索引库位置": "Index cache path",
  "索引库状态": "Index status",
  "建库并发数": "Index concurrency",
  "单文件上限（MB）": "Max file size (MB)",
  "索引目录：": "Index directory:",
  "刷新状态": "Refresh status",
  "开始/继续建库": "Start / continue indexing",
  "搜索模式": "Search modes",
  "原词搜索": "Original only",
  "默认搜索": "Default",
  "全面搜索": "Full",
  "自定义搜索": "Custom",
  "只做原词检索：强关联、自动词表、一般关联、兜底全部关闭。": "Original keywords only: strong terms, dictionaries, general terms and fallback are all disabled.",
  "原词 + 强关联 + 自动词表（含自定义词表）+ 一般关联全部开启；文件上限尽量放开，输出可能很大。": "Original keywords + strong terms + dictionaries (including custom) + general terms enabled; file limits are relaxed, so output may be large.",
  "展开下方步骤；数值默认使用本机已保存设置，可逐项调整。": "Expand the steps below; values default to the saved local settings and can be adjusted item by item.",
  "按当前已保存的本机设置执行；需要修改时切到「自定义搜索」。": "Use the saved local settings; switch to Custom to edit them.",
  "自定义词表": "Custom dictionary",
  "每行一个：关键词=关联词1,关联词2。同一个关键词的自定义词优先。默认、全面、自定义模式都会使用此表；原词搜索不使用。": "One per line: keyword=term1,term2. Custom terms win. Used by Default, Full and Custom modes; Original-only does not use it.",
  "自动补索引": "Auto-sync index",
  "原词检索（必开）": "Original search (required)",
  "原词检索·输出文件数": "Original search · max files",
  "全部": "All",
  "原词检索·每文件位置数": "Original search · positions per file",
  "原词检索·片段长度": "Original search · snippet length",
  "强关联词": "Strong terms",
  "上限": "limit",
  "降级判定": "Demotion rule",
  "超过直接命中数的倍数": "Exceeds direct-hit factor",
  "超过固定文件数": "Exceeds fixed file count",
  "占比超过阈值": "Exceeds library ratio",
  "以领域词结尾": "Ends with a domain suffix",
  "以上任一": "Any of the above",
  "倍数阈值": "Factor threshold",
  "固定文件数": "Fixed file count",
  "占比阈值（%）": "Ratio threshold (%)",
  "强关联输出·最多文件数": "Strong output · max files",
  "强关联输出·每文件位置数": "Strong output · positions per file",
  "强关联输出·片段长度": "Strong output · snippet length",
  "自动关联词扩展（词表）": "Automatic dictionary expansion",
  "数量": "count",
  "关联词输出·最多文件数": "Association output · max files",
  "关联词输出·每文件位置数": "Association output · positions per file",
  "关联词输出·片段长度": "Association output · snippet length",
  "一般关联词": "General terms",
  "允许一般关联词带入文件": "Allow general terms to bring files",
  "匹配范围": "Match scope",
  "同文件": "Same file",
  "同段/页": "Same block/page",
  "显示命中片段": "Show snippets",
  "显示题号": "Show question numbers",
  "合并重复文件": "Merge duplicate files",
  "降级后重复搜索": "Retry after demotion",
  "最多": "max",
  "遍": "times",
  "最终输出": "Final output",
  "最终输出文件数": "Final output files",
  "目录输出": "Outline output",
  "目录默认文件数": "Default outline files",
  "安全": "Security",
  "ZIP 最大条目数": "Max ZIP entries",
  "单条目解压上限（MB）": "Max entry size (MB)",
  "总解压上限（MB）": "Max total extracted size (MB)",
  "压缩比上限": "Max compression ratio",
  "抽取文本上限（MB）": "Max extracted text (MB)",
  "解析隔离（推荐）": "Parser isolation (recommended)",
  "解析 worker 内存上限（MB）": "Parser worker memory (MB)",
  "允许 Office 宏（不推荐）": "Allow Office macros (not recommended)",
  "保存中…": "Saving…",
  "保存": "Save",
  "恢复默认": "Restore defaults",
  "强关联领域词后缀": "Strong-term domain suffixes",
  "这里编辑第一层通用后缀；模型选择 subject 时自动追加该学科后缀。学科后缀只影响强关联降级，不会进入扩展词表。": "Edit the base suffixes here. Choosing a subject automatically adds that subject's suffixes for strong-term demotion only; they never enter the expansion dictionaries.",
  "每行一个：关键词=关联词1,关联词2。同一个关键词的自定义词优先，剩余名额用内置词表补齐；不相关的自定义词不会参与检索。": "One per line: keyword=term1,term2. Custom terms win; unrelated entries do not participate.",
  "每行一个：关键词=关联词1,关联词2。同一个关键词的自定义词优先。默认/全面/自定义模式都会使用；原词搜索不使用。": "One per line: keyword=term1,term2. Custom terms win. Used by Default, Full and Custom modes; Original-only does not use it.",
  "这里控制检索输出、题库位置和索引位置。只改输出用「仅保存设置」；修改路径后点「保存并开始/继续建库」，按钮会先保存再建库。": "Controls search output, library path and index path. Output-only changes do not rebuild; saving a path change starts indexing.",
  "填写题库位置并保存后会自动开始建索引。": "Fill in the library path and save to start indexing automatically.",
  "关闭后只给文件和位置，不回传片段；最省 token。": "When off, only files and positions are returned; snippets are omitted to save tokens.",
  "在位置后标出文中题号；汇编卷题号可能重排，关闭可少一点文字。": "Show the question number found in the text; compiled papers may renumber questions. Turn off to save space.",
  "合并命中内容完全相同的文件（同一套卷的 doc/pdf 等）；会少列文件，默认关闭。": "Merge files with identical hits (e.g. DOC/PDF copies); fewer files are listed. Off by default.",
  "所有类别合计最多输出多少个文件。有上限时先保留直接命中，再自动扩展，最后强关联；默认全部。": "Maximum total files across categories. With a cap, direct hits are kept first, then auto-expanded, then strong terms. Default: all.",
  "library_outline 一次最多列多少文件；只影响目录，不影响检索和索引。": "Maximum files listed by library_outline in one call; affects outline output only, not search or indexing.",
  "限制恶意压缩包和解析资源消耗；修改后下一次建库/重新抽取生效，已有成功缓存不会自动重抽。": "Limits malicious archives and parser resource use. Changes apply to the next build/re-extraction; existing successful cache is not re-extracted automatically.",
  "一个 docx/pptx/xlsx 最多允许多少个压缩条目。": "Maximum number of archive entries in one docx/pptx/xlsx.",
  "单个压缩条目解压后的最大体积。": "Maximum uncompressed size of one archive entry.",
  "整个压缩包解压后的总上限；超过会中止该文件。": "Maximum total uncompressed size for one archive; exceeding it aborts that file.",
  "解压总大小相对压缩文件大小的最大倍数。": "Maximum ratio of extracted size to compressed file size.",
  "单个文件抽取出的文本字符上限（MB 按字符计）。": "Maximum extracted text per file (MB counted as characters).",
  "每个文件在独立 worker 中解析，解析器崩溃或 OOM 不会拖垮 DSH；会略慢。": "Parse each file in a separate worker so a parser crash or OOM does not take down DSH; slightly slower.",
  "单个解析 worker 的 V8 老生代内存上限；不是整个进程的绝对内存。": "V8 old-generation memory limit for one parser worker; not an absolute limit for the whole process.",
  "默认关闭。只在确认题库可信、且旧版文档宏是必要功能时打开；打开后恶意宏可能以你的权限执行。": "Off by default. Enable only for a trusted library when legacy macros are required; malicious macros may then run with your permissions.",
  "读取失败": "Read failed",
  "读取失败：": "Read failed: ",
  "读取本地搜索设置…": "Reading local search settings…",
  "已保存；但建索引未启动：": "Saved; indexing was not started: ",
  "已保存；已开始自动建索引。": "Saved; automatic indexing started.",
  "已保存；": "Saved; ",
  "已保存；下一次检索/目录调用生效。": "Saved; takes effect on the next search/outline call.",
  "保存失败：": "Save failed: ",
  "正在启动建索引…": "Starting indexing…",
  "已开始建索引。": "Indexing started.",
  "启动建索引失败：": "Failed to start indexing: ",
  "读取中…": "Reading…",
  "建库中…": "Indexing…",
  "待建 ": "Pending ",
  " 个文件": " files",
  "已建 ": "Indexed ",
  " 个，失败 ": ", failed ",
  " 个": " files",
  "已就绪": "Ready",
  "题库/数据库文件夹的绝对路径。填好后新会话会自动使用，不再先问路径；留空则仍需在对话里提供。": "Absolute path to the library folder. New sessions use it automatically; leave empty to provide it in chat.",
  "索引缓存目录。留空使用默认 %LOCALAPPDATA%\\\\dsh-library-search；保存时会自动迁移并删除旧索引，目标已有同名索引则跳过并保留旧目录。": "Index cache directory. Empty uses the default %LOCALAPPDATA%\\dsh-library-search; saving migrates and removes the old index when possible.",
  "默认：%LOCALAPPDATA%\\\\dsh-library-search": "Default: %LOCALAPPDATA%\\dsh-library-search",
  "读取索引状态…": "Reading index status…",
  "docx / pdf / xlsx 等并行抽取；.doc / .ppt / .rtf 仍串行，避免 Office 冲突。": "Parallel extraction for docx/pdf/xlsx; .doc/.ppt/.rtf stay serial to avoid Office conflicts.",
  "单个文件大小上限；超过直接跳过。大型图片汇编 docx 可调到 200–500，内存占用也会上升。": "Per-file size limit; larger files are skipped. Large image-heavy docx files may need 200–500 MB.",
  "先选搜索模式；只有「自定义搜索」才展开下面的逐项设置。": "Choose a mode first; only Custom expands the detailed settings below.",
  "执行 1 次。搜索前检查题库更新并补索引；关闭后只查现有缓存，新文件和改动不会出现。": "Runs once. Checks for library updates and fills the index; when off, only the existing cache is searched.",
  "执行 1 次，始终执行：用你给的关键词搜缓存；这是唯一必开的步骤。": "Runs once and is always on: searches the cache using your keywords.",
  "只作用于直接命中原词的文件。“全部”最全也最贵；关联词命中的文件用下面第 4/5 步的“关联词输出”上限。": "Applies only to files that directly contain the original keyword. All is most complete and most expensive; association-only files use the output limits in steps 4/5.",
  "直接命中的文件，每个最多列几处；总数仍会显示“另有 N 处未显示”。": "Maximum positions listed per directly matched file; the total still reports hidden hits.",
  "直接命中的片段截取多少字；越短越省 token。": "Characters captured for each direct-hit snippet; shorter saves tokens.",
  "执行 1 次，与第 2 步合并扫描。人名、旧称、别名、缩写、近义词、标准术语优先放这里；默认最多 2 个；不要填父类/领域词。工具会检查广度，过宽或超出数量上限的降级。": "Runs once together with step 2. Put people, former names, aliases, abbreviations, synonyms and standard terms here; default maximum 2. Leave parent/domain terms out. The gate demotes overly broad terms or terms beyond the limit.",
  "选择什么算“过宽”：文件数阈值、占全库比例、领域词结尾，或三者任一。": "Choose what counts as too broad: file threshold, library ratio, domain suffix, or any of them.",
  "默认保留规则：直接命中 >5 时，超过其 2 倍或全库 20% 即降级；直接命中 ≤5 时这两条不启用。领域词结尾仍降级；最多保留「强关联词上限」个，只有过宽或超出上限才降级。": "Default gate: with more than 5 direct files, demote a term above 2× the direct count or 20% of the library; those two rules are off at 5 or fewer direct files. Domain suffixes still demote. Keep at most the strong-term limit; demote only broad terms or terms beyond the limit.",
  "固定文件数阈值；仅在“超过固定文件数”模式下生效，默认规则不使用它。": "Fixed file threshold; effective only in the fixed-file-count mode.",
  "强关联词命中文件占全库比例超过多少（%）就降级；模式含“占比”时生效。": "Demote a strong term when its file count exceeds this percentage of the library; effective when the mode includes ratio.",
  "强关联词命中的文件单独使用这些输出上限，不与第 4/5 步共用。": "Strong-only files use these output limits, separate from steps 4/5.",
  "强关联命中的每个文件最多列几处位置。": "Maximum positions listed per strong-term file.",
  "强关联命中的每段片段多少字。": "Characters captured per strong-term snippet.",
  "执行 1 次，与第 2 步合并扫描。插件内置词表（有机→烃/醇/醛…）；开启后需要设置“关联词数量上限”，输出共用下方“关联词输出”上限。": "Runs once with step 2. Built-in dictionary expansion (e.g. organic → hydrocarbons/alcohols/aldehydes); enabling it requires the association count limit and shares the association output limits below.",
  "第 4 步（自动词表）或第 5 步（一般关联）触发时共用：最多列多少文件；勾选“全部”不按文件数截断。普通原词检索不用它。": "Shared by step 4 (dictionary) and step 5 (general): maximum files listed; All disables the file-count cap. Original-only search does not use it.",
  "第 4 步或第 5 步触发时共用：每文件最多几处位置。": "Shared by step 4 or 5: maximum positions per file.",
  "第 4 步或第 5 步触发时共用：每段片段多少字。": "Shared by step 4 or 5: characters per snippet.",
  "执行 1 次，与第 2 步合并扫描。只放模型补充的宽泛领域词/上下文词；人物、专名、别名、近义词应放第 3 步强关联词。默认不新增文件，只在已命中原词的文件里补段落；零命中兜底时会自动带入。": "Runs once with step 2. Put only broad domain/context terms here; people, proper names, aliases and synonyms belong in strong terms (step 3). By default it adds no files and only fills paragraphs in already matched files; zero-hit fallback may still bring files.",
  "开启后：自动词表文件名额未满时，允许一般关联词补文件，和自动扩展共用最多文件数。直接命中与强关联都 0 时，即使关闭也会自动兜底带入。": "When on: if dictionary file slots are not full, general terms may add files and share the dictionary file cap. When direct and strong hits are both zero, fallback brings them in even when this is off.",
  "同文件=文件里出现即可；同段/页=必须同一段、同一页或同一单元格。越严命中越少、越便宜。": "Same file: the term may appear anywhere in the file. Same block/page: it must be in the same paragraph, page, slide or cell. Stricter is cheaper but may miss split terms.",
  "第 3 步的强关联词被降级时，是否用剩余强关联词再搜；重复次数在本工具调用内完成，不增加模型往返。": "When a strong term is demoted in step 3, retry with the remaining strong terms; retries stay inside this tool call and add no model round trip.",
  "这里控制检索输出、题库位置和索引位置。只改输出不会重建索引；修改题库/索引路径并保存后会自动开始建库。": "Controls search output, library path and index path. Output-only changes do not rebuild; saving a path change starts indexing.",
  "仅保存设置": "Save settings only",
  "保存并开始/继续建库": "Save & start/continue indexing",
  "正在保存并启动建索引…": "Saving and starting indexing…",
  "已保存；已开始建索引。": "Saved; indexing started.",
  "一个或多个题库文件夹的绝对路径，用逗号或换行分隔。每个题库单独建索引；删除其中一个不会影响其他题库的缓存。": "One or more absolute library folders, separated by commas or new lines. Each library gets its own index; removing one does not affect the others.",
  "只做原词检索：强关联、自动词表、一般关联、兜底全部关闭；最终最多 30 个文件，每文件 2 条。": "Original keywords only: strong terms, dictionaries, general terms and fallback are disabled; at most 30 files, 2 hits per file.",
  "原词 + 强关联 + 自动词表 + 一般关联全部开启；词表/一般关联最多 8 个，强关联最多 4 个；文件输出全部放开，一般关联可带入文件，输出可能很大。": "Original + strong + dictionaries + general terms all enabled; up to 8 dictionary/general terms and 4 strong terms; all file limits are open, general terms may bring files, output may be large.",
  "按当前已保存的本机设置执行，最终最多 30 个文件，每文件 2 条；需要修改时切到「自定义搜索」。": "Use saved local settings, at most 30 files and 2 hits per file; switch to Custom to edit."
};
    const isEnglish = () => !/^zh(?:-|$)/i.test(activeLocale);
    const tr = (value) => {
      if (typeof value !== 'string' || !isEnglish()) return value;
      if (value.startsWith('索引缓存目录。留空使用默认')) return 'Index cache directory. Empty uses the default %LOCALAPPDATA%\\dsh-library-search; saving migrates and removes the old index when possible.';
      if (value.startsWith('默认：%LOCALAPPDATA%')) return 'Default: %LOCALAPPDATA%\\dsh-library-search';
      if (EN[value]) return EN[value];
      const patterns = [
        [/^读取失败：(.*)$/, 'Read failed: $1'],
        [/^保存失败：(.*)$/, 'Save failed: $1'],
        [/^已保存；但建索引未启动：(.*)$/, 'Saved; indexing was not started: $1'],
        [/^启动建索引失败：(.*)$/, 'Failed to start indexing: $1'],
        [/^已保存；下一次检索\/目录调用生效。$/, 'Saved; applies to the next search/outline call.'],
        [/^待建 (.*)$/, 'Pending $1'],
        [/^已建 (.*)，失败 (.*)$/, 'Indexed $1, failed $2'],
      ];
      for (const [re, replacement] of patterns) {
        if (re.test(value)) return value.replace(re, replacement);
      }
      return value;
    };
    const trChildren = (children) => children.map((child) => {
      if (typeof child === 'string') return tr(child);
      if (Array.isArray(child)) return trChildren(child);
      return child;
    });
    const h = (type, props, ...children) => {
      const nextProps = props && typeof props.note === 'string' ? { ...props, note: tr(props.note) } : props;
      return React.createElement(type, nextProps, ...trChildren(children));
    };
    const API = '/api/dsh-folder-search/settings';
    const INDEX_API = '/api/dsh-folder-search/index';

    const card = {
      border: '1px solid var(--dsw-alias-border-secondary, rgba(128,128,128,.28))',
      borderRadius: '10px',
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    };
    const title = { fontSize: '13px', fontWeight: 600, margin: 0 };
    const note = { fontSize: '12px', lineHeight: 1.55, opacity: 0.72, margin: 0 };
    const row = { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' };
    const label = { fontSize: '13px', fontWeight: 500, minWidth: '148px' };
    const stepNo = { fontSize: '12px', opacity: 0.55, minWidth: '18px' };
    const input = {
      width: '86px',
      padding: '5px 8px',
      borderRadius: '6px',
      border: '1px solid var(--dsw-alias-border-secondary, rgba(128,128,128,.35))',
      background: 'var(--dsw-alias-bg-container, transparent)',
      color: 'inherit',
      fontSize: '13px',
    };
    const checkbox = { width: '15px', height: '15px' };
    const button = {
      padding: '7px 18px',
      borderRadius: '8px',
      border: '1px solid var(--dsw-alias-border-secondary, rgba(128,128,128,.35))',
      background: 'var(--dsw-alias-bg-container, transparent)',
      color: 'inherit',
      fontSize: '13px',
      cursor: 'pointer',
    };
    const primary = { ...button, fontWeight: 600 };

    function assocTextOf(map) {
      return Object.entries(map || {}).map(([key, values]) => key + '=' + values.join(',')).join('\n');
    }
    function parseSuffixText(text) {
      return String(text || '').split(/[,，\n]/).map((item) => item.trim()).filter(Boolean).slice(0, 50);
    }

    function parseAssocText(text) {
      const out = {};
      for (const line of String(text || '').split(/\r?\n/)) {
        const at = line.indexOf('=');
        if (at <= 0) continue;
        const key = line.slice(0, at).trim();
        const values = line.slice(at + 1).split(/[,，]/).map((v) => v.trim()).filter(Boolean).slice(0, 8);
        if (key && values.length) out[key] = values;
      }
      return out;
    }

    function num(value, fallback) {
      return Number.isFinite(Number(value)) ? Number(value) : fallback;
    }

    function formatBytes(value) {
      const bytes = Number(value || 0);
      if (!bytes) return '0 B';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
      return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    }

    function Field(props) {
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } }, h('div', { style: row }, props.children), props.note ? h('p', { style: note }, props.note) : null);
    }

    function Step(props) {
      return h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 0', borderTop: '1px solid var(--dsw-alias-border-secondary, rgba(128,128,128,.16))' } },
        h('div', { style: row }, h('span', { style: stepNo }, String(props.index) + '.'), props.children),
        props.note ? h('p', { style: { ...note, paddingLeft: '28px' } }, props.note) : null,
      );
    }

    function Page() {
      const [settings, setSettings] = React.useState(null);
      const [defaults, setDefaults] = React.useState(null);
      const [status, setStatus] = React.useState('');
      const [customText, setCustomText] = React.useState('');
      const [suffixText, setSuffixText] = React.useState('');
      const [busy, setBusy] = React.useState(false);
      const [indexStatus, setIndexStatus] = React.useState(null);
      const [indexBusy, setIndexBusy] = React.useState(false);
      const [pluginVersion, setPluginVersion] = React.useState('');
      const [, setLocaleRevision] = React.useState(0);

      React.useEffect(() => {
        if (!localeFace) return undefined;
        activeLocale = localeFace.getLocale().active;
        const unsubscribe = localeFace.subscribe(() => {
          activeLocale = localeFace.getLocale().active;
          setLocaleRevision((value) => value + 1);
        });
        return unsubscribe;
      }, []);

      const loadIndex = React.useCallback(async () => {
        try {
          const response = await fetch(INDEX_API, { cache: 'no-store' });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'HTTP ' + response.status);
          setIndexStatus(data.status || null);
        } catch (error) {
          setIndexStatus({ configured: false, error: error && error.message ? error.message : String(error) });
        }
      }, []);

      React.useEffect(() => {
        let alive = true;
        fetch(API, { cache: 'no-store' })
          .then((r) => r.json())
          .then((data) => {
            if (!alive) return;
            if (data.settings) {
              setSettings(data.settings);
              if (data.version) setPluginVersion(String(data.version));
              setCustomText(assocTextOf(data.settings.customAssociations));
              setSuffixText((data.settings.strongGateSuffixes || []).join(', '));
              setDefaults(data.defaults || null);
              loadIndex();
            } else {
              setStatus(data.error || '读取失败');
            }
          })
          .catch((error) => alive && setStatus('读取失败：' + (error && error.message ? error.message : String(error))));
        return () => {
          alive = false;
        };
      }, []);

      React.useEffect(() => {
        if (!indexStatus?.running) return undefined;
        const timer = setInterval(loadIndex, 2000);
        return () => clearInterval(timer);
      }, [indexStatus?.running, loadIndex]);

      if (!settings) {
        return h('div', { style: { padding: '24px 28px', fontSize: '13px', opacity: 0.75 } }, status || '读取本地搜索设置…');
      }

      const update = (patch) => setSettings((current) => ({ ...current, ...patch }));
      const persistSettings = async () => {
        const response = await fetch(API, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ settings }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'HTTP ' + response.status);
        setSettings(data.settings);
        setCustomText(assocTextOf(data.settings.customAssociations));
        setSuffixText((data.settings.strongGateSuffixes || []).join(', '));
        setDefaults(data.defaults || defaults);
        loadIndex();
        return data;
      };

      const save = async () => {
        setBusy(true);
        setStatus('');
        try {
          const data = await persistSettings();
          const migration = data.migration;
          if (data.buildError) {
            setStatus('已保存；但建索引未启动：' + data.buildError);
          } else if (data.buildQueued) {
            setStatus('已保存；已开始自动建索引。');
          } else if (migration && migration.moved) {
            const bits = [`已自动迁移 ${migration.moved} 个索引目录`];
            if (migration.removed) bits.push(`已删除 ${migration.removed} 个旧索引`);
            if (migration.skipped) bits.push(`跳过 ${migration.skipped} 个目标已存在的目录`);
            if (migration.removeFailed?.length) bits.push(`旧索引删除失败：${migration.removeFailed.join('、')}`);
            setStatus('已保存；' + bits.join('；') + '。');
          } else {
            setStatus('已保存；下一次检索/目录调用生效。');
          }
        } catch (error) {
          setStatus('保存失败：' + (error && error.message ? error.message : String(error)));
        } finally {
          setBusy(false);
        }
      };

      const buildIndex = async () => {
        setIndexBusy(true);
        setStatus('正在保存并启动建索引…');
        try {
          const data = await persistSettings();
          if (data.buildError) {
            setStatus('已保存；但建索引未启动：' + data.buildError);
            return;
          }
          if (data.buildQueued) {
            setStatus('已保存；已开始自动建索引。');
            return;
          }
          const response = await fetch(INDEX_API, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ action: 'build' }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'HTTP ' + response.status);
          setIndexStatus(result.status || null);
          setStatus('已保存；已开始建索引。');
        } catch (error) {
          setStatus('启动建索引失败：' + (error && error.message ? error.message : String(error)));
        } finally {
          setIndexBusy(false);
        }
      };

      const allFiles = settings.normalMaxFiles === 'all';
      const assocAll = settings.expandMaxFiles === 'all' || Number(settings.expandMaxFiles) >= 5000;
      const strongAll = settings.strongMaxFiles === 'all' || Number(settings.strongMaxFiles) >= 5000;
      const finalAll = settings.finalMaxFiles === 'all' || Number(settings.finalMaxFiles) >= 5000;
      const customMode = settings.searchMode === 'custom';
      const idx = indexStatus;
      const english = isEnglish();
      const indexPercent = idx?.documents ? Math.min(100, Math.round(((idx.ready || 0) / idx.documents) * 100)) : 0;
      const indexLabel = !idx
        ? (english ? 'Reading…' : '读取中…')
        : idx.phase === 'legacy'
          ? (english
            ? `Converting legacy: ${idx.legacyConverted || 0}, batch ${idx.legacyPending || 0}${idx.legacyCurrent ? ' (' + String(idx.legacyCurrent).split('/').pop() + ')' : ''}`
            : `旧版转换中：已转 ${idx.legacyConverted || 0}，本批 ${idx.legacyPending || 0} 个${idx.legacyCurrent ? '（' + String(idx.legacyCurrent).split('/').pop() + '）' : ''}`)
          : idx.running
            ? (english ? 'Indexing…' : '建库中…')
            : idx.pending > 0
              ? (english ? `Pending ${idx.pending} files` : `待建 ${idx.pending} 个文件`)
              : idx.failed > 0
                ? (english ? `Indexed ${idx.ready || 0}, failed ${idx.failed}` : `已建 ${idx.ready || 0} 个，失败 ${idx.failed} 个`)
                : (english ? 'Ready' : '已就绪');
      const indexDetail = idx
        ? (english
          ? `Completed ${idx.ready || 0} / ${idx.documents || 0} files, pending ${idx.pending || 0}${idx.failed ? `, failed ${idx.failed}` : ''}`
          : `已完成 ${idx.ready || 0} / ${idx.documents || 0} 个文件，待建 ${idx.pending || 0}${idx.failed ? `，失败 ${idx.failed}` : ''}`)
        : '';
      const suffixField = () => h(
        Field,
        { note: '这里编辑第一层通用后缀；模型选择 subject 时自动追加该学科后缀。学科后缀只影响强关联降级，不会进入扩展词表。' },
        h('span', { style: label }, '强关联领域词后缀'),
        h('textarea', {
          style: { ...input, width: '100%', minHeight: '54px', fontFamily: 'inherit', resize: 'vertical' },
          value: suffixText,
          onChange: (event) => {
            setSuffixText(event.target.value);
            update({ strongGateSuffixes: parseSuffixText(event.target.value) });
          },
        }),
      );

      return h(
        'div',
        { style: { padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '820px' } },
        h('h2', { style: { fontSize: '17px', margin: 0, display: 'flex', alignItems: 'baseline', gap: '8px' } },
          '本地搜索设置',
          pluginVersion ? h('span', { style: { fontSize: '11px', fontWeight: 400, opacity: 0.55 } }, 'v' + pluginVersion) : null,
        ),
        h('p', { style: note }, '这里控制检索输出、题库位置和索引位置。只改输出不会重建索引；修改题库/索引路径并保存后会自动开始建库。'),
        h(
          'div',
          { style: card },
          h('p', { style: title }, '数据库与索引库位置'),
          h(
            Field,
            { note: '一个或多个题库文件夹的绝对路径，用逗号或换行分隔。每个题库单独建索引；删除其中一个不会影响其他题库的缓存。' },
            h('span', { style: label }, '题库位置'),
            h('textarea', {
              style: { ...input, width: '100%', minHeight: '64px', fontFamily: 'inherit', resize: 'vertical' },
              value: (settings.libraryRoots || (settings.libraryRoot ? [settings.libraryRoot] : [])).join('\n'),
              onChange: (e) => {
                const roots = e.target.value.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean);
                update({ libraryRoots: roots, libraryRoot: roots[0] || '' });
              },
            }),
          ),
          h(
            Field,
            { note: '索引缓存目录。留空使用默认 %LOCALAPPDATA%\\dsh-library-search；保存时会自动迁移并删除旧索引，目标已有同名索引则跳过并保留旧目录。' },
            h('span', { style: label }, '索引库位置'),
            h('input', {
              type: 'text',
              style: { ...input, width: '100%' },
              value: settings.cacheDir || '',
              placeholder: '默认：%LOCALAPPDATA%\\dsh-library-search',
              onChange: (e) => update({ cacheDir: e.target.value }),
            }),
          ),
        ),
        h(
          'div',
          { style: card },
          h('p', { style: title }, '索引库状态'),
          !settings.libraryRoot
            ? h('p', { style: note }, '填写题库位置并保存后会自动开始建索引。')
            : !idx
              ? h('p', { style: note }, '读取索引状态…')
              : h(
                  'div',
                  { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                  h('p', { style: { ...note, opacity: 0.9 } }, indexLabel + ' · ' + indexDetail + (idx.error ? (english ? ': ' : '：') + idx.error : '')),
                  h(
                    'div',
                    { style: { height: '8px', borderRadius: '999px', background: 'var(--dsw-alias-border-secondary, rgba(128,128,128,.2))', overflow: 'hidden' } },
                    h('div', { style: { height: '100%', width: indexPercent + '%', background: 'var(--dsw-alias-brand-primary, #3b82f6)' } }),
                  ),
                  h(
                    Field,
                    { note: 'docx / pdf / xlsx 等并行抽取；.doc / .ppt / .rtf 仍串行，避免 Office 冲突。' },
                    h('span', { style: label }, '建库并发数'),
                    h('input', { type: 'number', min: 1, max: 8, style: input, value: num(settings.indexConcurrency, 3), onChange: (e) => update({ indexConcurrency: Math.max(1, Math.min(8, num(e.target.value, 3))) }) }),
                  ),
                  h(
                    Field,
                    { note: '单个文件大小上限；超过直接跳过。大型图片汇编 docx 可调到 200–500，内存占用也会上升。' },
                    h('span', { style: label }, '单文件上限（MB）'),
                    h('input', { type: 'number', min: 1, max: 2000, style: input, value: num(settings.maxFileMB, 200), onChange: (e) => update({ maxFileMB: Math.max(1, Math.min(2000, num(e.target.value, 200))) }) }),
                  ),
                  h('p', { style: note }, english ? `Index size: ${formatBytes(idx.cacheBytes)} · Indexed ${idx.ready || 0} / ${idx.documents || 0} files${idx.failed ? ` · failed ${idx.failed}` : ''}` : `索引大小：${formatBytes(idx.cacheBytes)} · 已索引 ${idx.ready || 0} / ${idx.documents || 0} 个文件${idx.failed ? ` · 失败 ${idx.failed}` : ''}`),
                  idx.cacheDir ? h('p', { style: { ...note, wordBreak: 'break-all' } }, (english ? 'Index directory: ' : '索引目录：') + idx.cacheDir) : null,
                  h(
                    'div',
                    { style: { display: 'flex', gap: '8px', marginTop: '2px' } },
                    h('button', { type: 'button', style: button, disabled: indexBusy, onClick: loadIndex }, '刷新状态'),
                    h('button', { type: 'button', style: primary, disabled: indexBusy || idx.running || !(settings.libraryRoots?.length || settings.libraryRoot), onClick: buildIndex }, idx.running ? '建库中…' : '保存并开始/继续建库'),
                  ),
                ),
        ),
        h(
          'div',
          { style: card },
          h('p', { style: title }, '搜索模式'),
          h('p', { style: note }, '先选搜索模式；只有「自定义搜索」才展开下面的逐项设置。'),
          h(
            'div',
            { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
            ...[['original', '原词搜索'], ['default', '默认搜索'], ['full', '全面搜索'], ['custom', '自定义搜索']].map(([value, label]) =>
              h('button', {
                key: value,
                type: 'button',
                style: {
                  ...button,
                  padding: '5px 12px',
                  fontSize: '12px',
                  borderColor: (settings.searchMode || 'default') === value ? 'var(--dsw-alias-brand-primary, #3b82f6)' : 'var(--dsw-alias-border-secondary, rgba(128,128,128,.35))',
                  fontWeight: (settings.searchMode || 'default') === value ? 600 : 400,
                },
                onClick: () => update({ searchMode: value }),
              }, label),
            ),
          ),
          h('p', { style: note }, (settings.searchMode || 'default') === 'original'
            ? '只做原词检索：强关联、自动词表、一般关联、兜底全部关闭；最终最多 30 个文件，每文件 2 条。'
            : (settings.searchMode || 'default') === 'full'
              ? '原词 + 强关联 + 自动词表 + 一般关联全部开启；词表/一般关联最多 8 个，强关联最多 4 个；文件输出全部放开，一般关联可带入文件，输出可能很大。'
              : (settings.searchMode || 'default') === 'custom'
                ? '展开下方步骤；数值默认使用本机已保存设置，可逐项调整。'
                : '按当前已保存的本机设置执行，最终最多 30 个文件，每文件 2 条；需要修改时切到「自定义搜索」。'),
          (settings.searchMode || 'default') === 'custom' || settings.searchMode === 'original' ? null : h(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 12px', border: '1px solid var(--dsw-alias-border-secondary, rgba(128,128,128,.28))', borderRadius: '8px' } },
            suffixField(),
          ),
          settings.searchMode === 'original' ? null : h(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 12px', border: '1px solid var(--dsw-alias-border-secondary, rgba(128,128,128,.28))', borderRadius: '8px' } },
            h('p', { style: title }, '自定义词表'),
            h(
              Field,
              { note: '每行一个：关键词=关联词1,关联词2。同一个关键词的自定义词优先。默认、全面、自定义模式都会使用此表；原词搜索不使用。' },
              h('textarea', {
                style: { ...input, width: '100%', minHeight: '78px', fontFamily: 'inherit', resize: 'vertical' },
                value: customText,
                onChange: (event) => {
                  setCustomText(event.target.value);
                  update({ customAssociations: parseAssocText(event.target.value) });
                },
              }),
            ),
          ),
          h(
            'div',
            { style: { display: customMode ? 'flex' : 'none', flexDirection: 'column', gap: '0px' } },
          h(
            Step,
            { index: 1, note: '执行 1 次。搜索前检查题库更新并补索引；关闭后只查现有缓存，新文件和改动不会出现。' },
            h('input', { type: 'checkbox', style: checkbox, checked: settings.syncBeforeSearch !== false, onChange: (e) => update({ syncBeforeSearch: e.target.checked }) }),
            h('span', { style: { fontSize: '13px' } }, '自动补索引'),
          ),
          h(
            Step,
            { index: 2, note: '执行 1 次，始终执行：用你给的关键词搜缓存；这是唯一必开的步骤。' },
            h('input', { type: 'checkbox', style: checkbox, checked: true, disabled: true }),
            h('span', { style: { fontSize: '13px' } }, '原词检索（必开）'),
          ),
          h(
            'div',
            { style: { paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '8px' } },
            h(
              Field,
              { note: '只作用于直接命中原词的文件。“全部”最全也最贵；关联词命中的文件用下面第 4/5 步的“关联词输出”上限。' },
              h('span', { style: label }, '原词检索·输出文件数'),
              h('input', { type: 'checkbox', style: checkbox, checked: allFiles, onChange: (e) => update({ normalMaxFiles: e.target.checked ? 'all' : 16 }) }),
              h('span', { style: { fontSize: '13px' } }, '全部'),
              h('input', {
                type: 'number', min: 1, max: 5000, style: input, disabled: allFiles,
                value: allFiles ? '' : num(settings.normalMaxFiles, 16),
                onChange: (e) => update({ normalMaxFiles: num(e.target.value, 1) }),
              }),
            ),
            h(
              Field,
              { note: '直接命中的文件，每个最多列几处；总数仍会显示“另有 N 处未显示”。' },
              h('span', { style: label }, '原词检索·每文件位置数'),
              h('input', { type: 'number', min: 1, max: 50, style: input, value: num(settings.normalMaxBlocksPerFile, 2), onChange: (e) => update({ normalMaxBlocksPerFile: num(e.target.value, 1) }) }),
            ),
            h(
              Field,
              { note: '直接命中的片段截取多少字；越短越省 token。' },
              h('span', { style: label }, '原词检索·片段长度'),
              h('input', { type: 'number', min: 20, max: 400, style: input, value: num(settings.normalSnippetChars, 90), onChange: (e) => update({ normalSnippetChars: num(e.target.value, 20) }) }),
            ),
          ),
          h(
            Step,
            { index: 3, note: '执行 1 次，与第 2 步合并扫描。人名、旧称、别名、缩写、近义词、标准术语优先放这里；默认最多 2 个；不要填父类/领域词。工具会检查广度，过宽或超出数量上限的降级。' },
            h('input', { type: 'checkbox', style: checkbox, checked: settings.enableStrong !== false, onChange: (e) => update({ enableStrong: e.target.checked }) }),
            h('span', { style: { fontSize: '13px' } }, '强关联词'),
            h('span', { style: { ...label, minWidth: 'auto' } }, '上限'),
            h('input', { type: 'number', min: 0, max: 4, style: input, value: num(settings.strongLimit, 2), onChange: (e) => update({ strongLimit: Math.max(0, num(e.target.value, 2)) }) }),
          ),
          h(
            'div',
            { style: { paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '8px' } },
            h(
              Field,
              { note: '选择什么算“过宽”：文件数阈值、占全库比例、领域词结尾，或三者任一。' },
              h('span', { style: label }, '降级判定'),
              h('select', { style: { ...input, width: '150px' }, value: settings.strongGateMode || 'all', onChange: (e) => update({ strongGateMode: e.target.value }) },
                h('option', { value: 'factor' }, '超过直接命中数的倍数'),
                h('option', { value: 'files' }, '超过固定文件数'),
                h('option', { value: 'ratio' }, '占比超过阈值'),
                h('option', { value: 'domain' }, '以领域词结尾'),
                h('option', { value: 'all' }, '以上任一'),
              ),
            ),
            h(
              Field,
              { note: '默认保留规则：直接命中 >5 时，超过其 2 倍或全库 20% 即降级；直接命中 ≤5 时这两条不启用。领域词结尾仍降级；最多保留「强关联词上限」个，只有过宽或超出上限才降级。' },
              h('span', { style: label }, '倍数阈值'),
              h('input', { type: 'number', min: 1, max: 10, style: input, value: num(settings.strongGateFactor, 2), onChange: (e) => update({ strongGateFactor: num(e.target.value, 2) }) }),
            ),
            h(
              Field,
              { note: '固定文件数阈值；仅在“超过固定文件数”模式下生效，默认规则不使用它。' },
              h('span', { style: label }, '固定文件数'),
              h('input', { type: 'number', min: 1, max: 5000, style: input, value: num(settings.strongGateFiles, 50), onChange: (e) => update({ strongGateFiles: num(e.target.value, 50) }) }),
            ),
            h(
              Field,
              { note: '强关联词命中文件占全库比例超过多少（%）就降级；模式含“占比”时生效。' },
              h('span', { style: label }, '占比阈值（%）'),
              h('input', { type: 'number', min: 1, max: 100, style: input, value: num(settings.strongGateRatio, 20), onChange: (e) => update({ strongGateRatio: num(e.target.value, 20) }) }),
            ),
            suffixField(),
            h(
              Field,
              { note: '强关联词命中的文件单独使用这些输出上限，不与第 4/5 步共用。' },
              h('span', { style: label }, '强关联输出·最多文件数'),
              h('input', { type: 'checkbox', style: checkbox, checked: strongAll, onChange: (e) => update({ strongMaxFiles: e.target.checked ? 'all' : 8 }) }),
              h('span', { style: { fontSize: '13px' } }, '全部'),
              h('input', { type: 'number', min: 1, max: 5000, style: input, disabled: strongAll, value: strongAll ? '' : num(settings.strongMaxFiles, 8), onChange: (e) => update({ strongMaxFiles: num(e.target.value, 6) }) }),
            ),
            h(
              Field,
              { note: '强关联命中的每个文件最多列几处位置。' },
              h('span', { style: label }, '强关联输出·每文件位置数'),
              h('input', { type: 'number', min: 1, max: 50, style: input, value: num(settings.strongMaxBlocksPerFile, 2), onChange: (e) => update({ strongMaxBlocksPerFile: num(e.target.value, 2) }) }),
            ),
            h(
              Field,
              { note: '强关联命中的每段片段多少字。' },
              h('span', { style: label }, '强关联输出·片段长度'),
              h('input', { type: 'number', min: 20, max: 400, style: input, value: num(settings.strongSnippetChars, 60), onChange: (e) => update({ strongSnippetChars: num(e.target.value, 45) }) }),
            ),
          ),
          h(
            Step,
            { index: 4, note: '执行 1 次，与第 2 步合并扫描。插件内置词表（有机→烃/醇/醛…）；开启后需要设置“关联词数量上限”，输出共用下方“关联词输出”上限。' },
            h('input', { type: 'checkbox', style: checkbox, checked: settings.expand !== false, onChange: (e) => update({ expand: e.target.checked }) }),
            h('span', { style: { fontSize: '13px' } }, '自动关联词扩展（词表）'),
            h('span', { style: { ...label, minWidth: 'auto' } }, '数量'),
            h('input', { type: 'number', min: 1, max: 8, style: input, value: num(settings.associationLimit, 2), onChange: (e) => update({ associationLimit: num(e.target.value, 4) }) }),
          ),
          h(
            'div',
            { style: { paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '8px' } },
            h(
              Field,
              { note: '第 4 步（自动词表）或第 5 步（一般关联）触发时共用：最多列多少文件；勾选“全部”不按文件数截断。普通原词检索不用它。' },
              h('span', { style: label }, '关联词输出·最多文件数'),
              h('input', { type: 'checkbox', style: checkbox, checked: assocAll, onChange: (e) => update({ expandMaxFiles: e.target.checked ? 'all' : 6 }) }),
              h('span', { style: { fontSize: '13px' } }, '全部'),
              h('input', { type: 'number', min: 1, max: 5000, style: input, disabled: assocAll, value: assocAll ? '' : num(settings.expandMaxFiles, 6), onChange: (e) => update({ expandMaxFiles: num(e.target.value, 1) }) }),
            ),
            h(
              Field,
              { note: '第 4 步或第 5 步触发时共用：每文件最多几处位置。' },
              h('span', { style: label }, '关联词输出·每文件位置数'),
              h('input', { type: 'number', min: 1, max: 50, style: input, value: num(settings.expandMaxBlocksPerFile, 2), onChange: (e) => update({ expandMaxBlocksPerFile: num(e.target.value, 1) }) }),
            ),
            h(
              Field,
              { note: '第 4 步或第 5 步触发时共用：每段片段多少字。' },
              h('span', { style: label }, '关联词输出·片段长度'),
              h('input', { type: 'number', min: 20, max: 400, style: input, value: num(settings.expandSnippetChars, 30), onChange: (e) => update({ expandSnippetChars: num(e.target.value, 20) }) }),
            ),
          ),
          h(
            Step,
            { index: 5, note: '执行 1 次，与第 2 步合并扫描。只放模型补充的宽泛领域词/上下文词；人物、专名、别名、近义词应放第 3 步强关联词。默认不新增文件，只在已命中原词的文件里补段落；零命中兜底时会自动带入。' },
            h('input', { type: 'checkbox', style: checkbox, checked: settings.enableGeneral !== false, onChange: (e) => update({ enableGeneral: e.target.checked }) }),
            h('span', { style: { fontSize: '13px' } }, '一般关联词'),
            h('span', { style: { ...label, minWidth: 'auto' } }, '数量'),
            h('input', { type: 'number', min: 0, max: 8, style: input, value: num(settings.generalLimit ?? settings.associationLimit, 1), onChange: (e) => update({ generalLimit: Math.max(0, Math.min(8, num(e.target.value, 2))) }) }),
          ),
          h(
            'div',
            { style: { paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '6px' } },
            h(
              Field,
              { note: '开启后：自动词表文件名额未满时，允许一般关联词补文件，和自动扩展共用最多文件数。直接命中与强关联都 0 时，即使关闭也会自动兜底带入。' },
              h('input', { type: 'checkbox', style: checkbox, checked: settings.allowGeneralFiles === true, onChange: (e) => update({ allowGeneralFiles: e.target.checked }) }),
              h('span', { style: { fontSize: '13px' } }, '允许一般关联词带入文件'),
            ),
          ),
          h(
            Step,
            { index: 6, note: '同文件=文件里出现即可；同段/页=必须同一段、同一页或同一单元格。越严命中越少、越便宜。' },
            h('span', { style: label }, '匹配范围'),
            h('select', { style: { ...input, width: '120px' }, value: settings.matchScope || 'file', onChange: (e) => update({ matchScope: e.target.value }) },
              h('option', { value: 'file' }, '同文件'),
              h('option', { value: 'block' }, '同段/页'),
            ),
          ),
          h(
            Step,
            { index: 7, note: '关闭后只给文件和位置，不回传片段；最省 token。' },
            h('input', { type: 'checkbox', style: checkbox, checked: settings.includeSnippets !== false, onChange: (e) => update({ includeSnippets: e.target.checked }) }),
            h('span', { style: { fontSize: '13px' } }, '显示命中片段'),
          ),
          h(
            Step,
            { index: 8, note: '在位置后标出文中题号；汇编卷题号可能重排，关闭可少一点文字。' },
            h('input', { type: 'checkbox', style: checkbox, checked: settings.includeQuestionNumbers !== false, onChange: (e) => update({ includeQuestionNumbers: e.target.checked }) }),
            h('span', { style: { fontSize: '13px' } }, '显示题号'),
          ),
          h(
            Step,
            { index: 9, note: '合并命中内容完全相同的文件（同一套卷的 doc/pdf 等）；会少列文件，默认关闭。' },
            h('input', { type: 'checkbox', style: checkbox, checked: settings.dedupe === true, onChange: (e) => update({ dedupe: e.target.checked }) }),
            h('span', { style: { fontSize: '13px' } }, '合并重复文件'),
          ),
          h(
            Step,
            { index: 10, note: '第 3 步的强关联词被降级时，是否用剩余强关联词再搜；重复次数在本工具调用内完成，不增加模型往返。' },
            h('input', { type: 'checkbox', style: checkbox, checked: settings.strongRetry === true, onChange: (e) => update({ strongRetry: e.target.checked }) }),
            h('span', { style: { fontSize: '13px' } }, '降级后重复搜索'),
            h('span', { style: { ...label, minWidth: 'auto' } }, '最多'),
            h('input', { type: 'number', min: 0, max: 5, style: input, value: num(settings.strongRetryMax, 1), onChange: (e) => update({ strongRetryMax: num(e.target.value, 1) }) }),
            h('span', { style: { fontSize: '13px' } }, '遍'),
          ),
          ),
        ),
        h(
          'div',
          { style: card },
          h('p', { style: title }, '最终输出'),
          h(
            Field,
            { note: '所有类别合计最多输出多少个文件。有上限时先保留直接命中，再自动扩展，最后强关联；默认全部。' },
            h('span', { style: label }, '最终输出文件数'),
            h('input', { type: 'checkbox', style: checkbox, checked: finalAll, onChange: (e) => update({ finalMaxFiles: e.target.checked ? 'all' : 30 }) }),
            h('span', { style: { fontSize: '13px' } }, '全部'),
            h('input', { type: 'number', min: 1, max: 5000, style: input, disabled: finalAll, value: finalAll ? '' : num(settings.finalMaxFiles, 30), onChange: (e) => update({ finalMaxFiles: num(e.target.value, 20) }) }),
          ),
        ),
        h(
          'div',
          { style: card },
          h('p', { style: title }, '目录输出'),
          h(
            Field,
            { note: 'library_outline 一次最多列多少文件；只影响目录，不影响检索和索引。' },
            h('span', { style: label }, '目录默认文件数'),
            h('input', { type: 'number', min: 1, max: 200, style: input, value: num(settings.outlineMaxFiles, 60), onChange: (e) => update({ outlineMaxFiles: num(e.target.value, 1) }) }),
          ),
        ),
        h(
          'div',
          { style: card },
          h('p', { style: title }, '安全'),
          h('p', { style: note }, '限制恶意压缩包和解析资源消耗；修改后下一次建库/重新抽取生效，已有成功缓存不会自动重抽。'),
          h(
            Field,
            { note: '一个 docx/pptx/xlsx 最多允许多少个压缩条目。' },
            h('span', { style: label }, 'ZIP 最大条目数'),
            h('input', { type: 'number', min: 16, max: 20000, style: input, value: num(settings.zipMaxEntries, 5000), onChange: (e) => update({ zipMaxEntries: Math.max(16, Math.min(20000, num(e.target.value, 5000))) }) }),
          ),
          h(
            Field,
            { note: '单个压缩条目解压后的最大体积。' },
            h('span', { style: label }, '单条目解压上限（MB）'),
            h('input', { type: 'number', min: 1, max: 1024, style: input, value: num(settings.zipMaxEntryMB, 64), onChange: (e) => update({ zipMaxEntryMB: Math.max(1, Math.min(1024, num(e.target.value, 64))) }) }),
          ),
          h(
            Field,
            { note: '整个压缩包解压后的总上限；超过会中止该文件。' },
            h('span', { style: label }, '总解压上限（MB）'),
            h('input', { type: 'number', min: 8, max: 4096, style: input, value: num(settings.zipMaxTotalMB, 512), onChange: (e) => update({ zipMaxTotalMB: Math.max(8, Math.min(4096, num(e.target.value, 512))) }) }),
          ),
          h(
            Field,
            { note: '解压总大小相对压缩文件大小的最大倍数。' },
            h('span', { style: label }, '压缩比上限'),
            h('input', { type: 'number', min: 2, max: 1000, style: input, value: num(settings.zipMaxRatio, 200), onChange: (e) => update({ zipMaxRatio: Math.max(2, Math.min(1000, num(e.target.value, 200))) }) }),
          ),
          h(
            Field,
            { note: '单个文件抽取出的文本字符上限（MB 按字符计）。' },
            h('span', { style: label }, '抽取文本上限（MB）'),
            h('input', { type: 'number', min: 1, max: 200, style: input, value: num(settings.maxTextMB, 20), onChange: (e) => update({ maxTextMB: Math.max(1, Math.min(200, num(e.target.value, 20))) }) }),
          ),
          h(
            Field,
            { note: '每个文件在独立 worker 中解析，解析器崩溃或 OOM 不会拖垮 DSH；会略慢。' },
            h('input', { type: 'checkbox', style: checkbox, checked: settings.parseIsolation !== false, onChange: (e) => update({ parseIsolation: e.target.checked }) }),
            h('span', { style: { fontSize: '13px' } }, '解析隔离（推荐）'),
          ),
          h(
            Field,
            { note: '单个解析 worker 的 V8 老生代内存上限；不是整个进程的绝对内存。' },
            h('span', { style: label }, '解析 worker 内存上限（MB）'),
            h('input', { type: 'number', min: 64, max: 1024, style: input, value: num(settings.parseWorkerMB, 256), onChange: (e) => update({ parseWorkerMB: Math.max(64, Math.min(1024, num(e.target.value, 256))) }) }),
          ),
          h(
            Field,
            { note: '默认关闭。只在确认题库可信、且旧版文档宏是必要功能时打开；打开后恶意宏可能以你的权限执行。' },
            h('input', { type: 'checkbox', style: checkbox, checked: settings.officeAllowMacros === true, onChange: (e) => update({ officeAllowMacros: e.target.checked }) }),
            h('span', { style: { fontSize: '13px' } }, '允许 Office 宏（不推荐）'),
          ),
        ),
        h(
          'div',
          { style: { display: 'flex', gap: '10px', alignItems: 'center' } },
          h('button', { type: 'button', style: primary, disabled: busy, onClick: save }, busy ? '保存中…' : '仅保存设置'),
          h('button', { type: 'button', style: button, disabled: busy || !defaults, onClick: () => { if (!defaults) return; setSettings({ ...defaults }); setCustomText(assocTextOf(defaults.customAssociations)); setSuffixText((defaults.strongGateSuffixes || []).join(', ')); } }, '恢复默认'),
          status ? h('span', { style: { fontSize: '12px', opacity: 0.8 } }, status) : null,
        ),
      );
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        localeFace = ctx.locale || (typeof ctx.get === 'function' ? ctx.get('locale') : null);
        if (localeFace?.getLocale) activeLocale = localeFace.getLocale().active;
        else if (typeof document !== 'undefined' && document.documentElement?.lang) activeLocale = document.documentElement.lang;
        let sectionDisposer = null;
        const registerSection = () => {
          if (sectionDisposer) sectionDisposer();
          sectionDisposer = ctx.slots.register({
            name: 'settings.section',
            id: 'folder-search',
            order: 50,
            label: isEnglish() ? 'Local Search Settings' : '本地搜索设置',
          }, Page);
        };
        ctx.slots.inject('settings.section', registerSection);
        if (localeFace?.subscribe) {
          localeFace.subscribe(() => {
            activeLocale = localeFace.getLocale().active;
            registerSection();
          });
        }
      },
    };
  },
});
