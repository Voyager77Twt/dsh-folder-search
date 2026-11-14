import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
const old="    const React = require('react');\n    const h = React.createElement;\n    const API = '/api/dsh-folder-search/settings';";
const map = {
"本地搜索设置":"Local Search Settings","数据库与索引库位置":"Database and index location","题库位置":"Library path","索引库位置":"Index cache path","索引库状态":"Index status","建库并发数":"Index concurrency","单文件上限（MB）":"Max file size (MB)","索引目录：":"Index directory:","刷新状态":"Refresh status","开始/继续建库":"Start / continue indexing","搜索模式":"Search modes","原词搜索":"Original only","默认搜索":"Default","全面搜索":"Full","自定义搜索":"Custom","只做原词检索：强关联、自动词表、一般关联、兜底全部关闭。":"Original keywords only: strong terms, dictionaries, general terms and fallback are all disabled.","原词 + 强关联 + 自动词表（含自定义词表）+ 一般关联全部开启；文件上限尽量放开，输出可能很大。":"Original keywords + strong terms + dictionaries (including custom) + general terms enabled; file limits are relaxed, so output may be large.","展开下方步骤；数值默认使用本机已保存设置，可逐项调整。":"Expand the steps below; values default to the saved local settings and can be adjusted item by item.","按当前已保存的本机设置执行；需要修改时切到「自定义搜索」。":"Use the saved local settings; switch to Custom to edit them.","自定义词表":"Custom dictionary","每行一个：关键词=关联词1,关联词2。同一个关键词的自定义词优先。默认、全面、自定义模式都会使用此表；原词搜索不使用。":"One per line: keyword=term1,term2. Custom terms win. Used by Default, Full and Custom modes; Original-only does not use it.","自动补索引":"Auto-sync index","原词检索（必开）":"Original search (required)","原词检索·输出文件数":"Original search · max files","全部":"All","原词检索·每文件位置数":"Original search · positions per file","原词检索·片段长度":"Original search · snippet length","强关联词":"Strong terms","上限":"limit","降级判定":"Demotion rule","超过直接命中数的倍数":"Exceeds direct-hit factor","超过固定文件数":"Exceeds fixed file count","占比超过阈值":"Exceeds library ratio","以领域词结尾":"Ends with a domain suffix","以上任一":"Any of the above","倍数阈值":"Factor threshold","固定文件数":"Fixed file count","占比阈值（%）":"Ratio threshold (%)","强关联输出·最多文件数":"Strong output · max files","强关联输出·每文件位置数":"Strong output · positions per file","强关联输出·片段长度":"Strong output · snippet length","自动关联词扩展（词表）":"Automatic dictionary expansion","数量":"count","关联词输出·最多文件数":"Association output · max files","关联词输出·每文件位置数":"Association output · positions per file","关联词输出·片段长度":"Association output · snippet length","一般关联词":"General terms","允许一般关联词带入文件":"Allow general terms to bring files","匹配范围":"Match scope","同文件":"Same file","同段/页":"Same block/page","显示命中片段":"Show snippets","显示题号":"Show question numbers","合并重复文件":"Merge duplicate files","降级后重复搜索":"Retry after demotion","最多":"max","遍":"times","最终输出":"Final output","最终输出文件数":"Final output files","目录输出":"Outline output","目录默认文件数":"Default outline files","安全":"Security","ZIP 最大条目数":"Max ZIP entries","单条目解压上限（MB）":"Max entry size (MB)","总解压上限（MB）":"Max total extracted size (MB)","压缩比上限":"Max compression ratio","抽取文本上限（MB）":"Max extracted text (MB)","解析隔离（推荐）":"Parser isolation (recommended)","解析 worker 内存上限（MB）":"Parser worker memory (MB)","允许 Office 宏（不推荐）":"Allow Office macros (not recommended)","保存中…":"Saving…","保存":"Save","恢复默认":"Restore defaults","强关联领域词后缀":"Strong-term domain suffixes","每行或逗号一个；留空关闭领域词降级。默认/全面/自定义模式都使用。默认只保留通用元词，化学或其他学科可自行追加。":"One per line or comma-separated; leave empty to disable suffix demotion. Used by Default, Full and Custom modes. Defaults keep generic meta suffixes; add chemistry or other subject terms as needed.","每行一个：关键词=关联词1,关联词2。同一个关键词的自定义词优先，剩余名额用内置词表补齐；不相关的自定义词不会参与检索。":"One per line: keyword=term1,term2. Custom terms win; unrelated entries do not participate.","每行一个：关键词=关联词1,关联词2。同一个关键词的自定义词优先。默认/全面/自定义模式都会使用；原词搜索不使用。":"One per line: keyword=term1,term2. Custom terms win. Used by Default, Full and Custom modes; Original-only does not use it.","这里控制检索输出、题库位置和索引位置。只改输出不会重建索引；修改题库/索引路径并保存后会自动开始建库。":"Controls search output, library path and index path. Output-only changes do not rebuild; saving a path change starts indexing.","填写题库位置并保存后会自动开始建索引。":"Fill in the library path and save to start indexing automatically.","关闭后只给文件和位置，不回传片段；最省 token。":"When off, only files and positions are returned; snippets are omitted to save tokens.","在位置后标出文中题号；汇编卷题号可能重排，关闭可少一点文字。":"Show the question number found in the text; compiled papers may renumber questions. Turn off to save space.","合并命中内容完全相同的文件（同一套卷的 doc/pdf 等）；会少列文件，默认关闭。":"Merge files with identical hits (e.g. DOC/PDF copies); fewer files are listed. Off by default.","所有类别合计最多输出多少个文件。有上限时先保留直接命中，再自动扩展，最后强关联；默认全部。":"Maximum total files across categories. With a cap, direct hits are kept first, then auto-expanded, then strong terms. Default: all.","library_outline 一次最多列多少文件；只影响目录，不影响检索和索引。":"Maximum files listed by library_outline in one call; affects outline output only, not search or indexing.","限制恶意压缩包和解析资源消耗；修改后下一次建库/重新抽取生效，已有成功缓存不会自动重抽。":"Limits malicious archives and parser resource use. Changes apply to the next build/re-extraction; existing successful cache is not re-extracted automatically.","一个 docx/pptx/xlsx 最多允许多少个压缩条目。":"Maximum number of archive entries in one docx/pptx/xlsx.","单个压缩条目解压后的最大体积。":"Maximum uncompressed size of one archive entry.","整个压缩包解压后的总上限；超过会中止该文件。":"Maximum total uncompressed size for one archive; exceeding it aborts that file.","解压总大小相对压缩文件大小的最大倍数。":"Maximum ratio of extracted size to compressed file size.","单个文件抽取出的文本字符上限（MB 按字符计）。":"Maximum extracted text per file (MB counted as characters).","每个文件在独立 worker 中解析，解析器崩溃或 OOM 不会拖垮 DSH；会略慢。":"Parse each file in a separate worker so a parser crash or OOM does not take down DSH; slightly slower.","单个解析 worker 的 V8 老生代内存上限；不是整个进程的绝对内存。":"V8 old-generation memory limit for one parser worker; not an absolute limit for the whole process.","默认关闭。只在确认题库可信、且旧版文档宏是必要功能时打开；打开后恶意宏可能以你的权限执行。":"Off by default. Enable only for a trusted library when legacy macros are required; malicious macros may then run with your permissions."
};
const header=`    const React = require('react');
    let activeLocale = 'zh-CN';
    let localeFace = null;
    const EN = ${JSON.stringify(map, null, 2)};
    const isEnglish = () => !/^zh(?:-|$)/i.test(activeLocale);
    const tr = (value) => {
      if (typeof value !== 'string' || !isEnglish()) return value;
      if (EN[value]) return EN[value];
      const patterns = [
        [/^读取失败：(.*)$/, 'Read failed: $1'],
        [/^保存失败：(.*)$/, 'Save failed: $1'],
        [/^已保存；但建索引未启动：(.*)$/, 'Saved; indexing was not started: $1'],
        [/^启动建索引失败：(.*)$/, 'Failed to start indexing: $1'],
        [/^已保存；下一次检索\\/目录调用生效。$/, 'Saved; applies to the next search/outline call.'],
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
    const API = '/api/dsh-folder-search/settings';`;
if(!c.includes(old)) throw new Error('client header marker missing');
c=c.replace(old,header);
// locale effect inside Page after state declarations
const stateMarker="      const [pluginVersion, setPluginVersion] = React.useState('');";
const localeEffect=`      const [pluginVersion, setPluginVersion] = React.useState('');
      const [, setLocaleRevision] = React.useState(0);

      React.useEffect(() => {
        if (!localeFace) return undefined;
        activeLocale = localeFace.getLocale().active;
        const unsubscribe = localeFace.subscribe(() => {
          activeLocale = localeFace.getLocale().active;
          setLocaleRevision((value) => value + 1);
        });
        return unsubscribe;
      }, []);`;
if(!c.includes(stateMarker)) throw new Error('state marker missing');
c=c.replace(stateMarker,localeEffect);
// apply locale face and translated label
c=c.replace("      inject: ['slots'],\n      apply(ctx) {\n        ctx.slots.inject('settings.section', () =>\n          ctx.slots.register({ name: 'settings.section', id: 'folder-search', order: 50, label: '本地搜索设置' }, Page),\n        );","      inject: ['slots'],\n      apply(ctx) {\n        localeFace = ctx.get('locale');\n        if (localeFace) activeLocale = localeFace.getLocale().active;\n        ctx.slots.inject('settings.section', () =>\n          ctx.slots.register({ name: 'settings.section', id: 'folder-search', order: 50, label: () => tr('本地搜索设置') }, Page),\n        );");
fs.writeFileSync(p,c,"utf8");
console.log("locale wrapper");
