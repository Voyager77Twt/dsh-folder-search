window.__ModuleLoader__.load({
  id: 'dsh-folder-search',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
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
      const [busy, setBusy] = React.useState(false);
      const [indexStatus, setIndexStatus] = React.useState(null);
      const [indexBusy, setIndexBusy] = React.useState(false);

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
              setCustomText(assocTextOf(data.settings.customAssociations));
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
      const save = async () => {
        setBusy(true);
        setStatus('');
        try {
          const response = await fetch(API, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ settings }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'HTTP ' + response.status);
          setSettings(data.settings);
          setCustomText(assocTextOf(data.settings.customAssociations));
          setDefaults(data.defaults || defaults);
          loadIndex();
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
        setStatus('正在启动建索引…');
        try {
          const response = await fetch(INDEX_API, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ action: 'build' }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'HTTP ' + response.status);
          setIndexStatus(data.status || null);
          setStatus('已开始建索引。');
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
      const idx = indexStatus;
      const indexPercent = idx?.documents ? Math.min(100, Math.round(((idx.ready || 0) / idx.documents) * 100)) : 0;
      const indexLabel = !idx ? '读取中…' : idx.phase === 'legacy' ? '旧版 Office 转换中…' : idx.running ? '建库中…' : idx.pending > 0 ? ('待建 ' + idx.pending + ' 个文件') : idx.failed > 0 ? ('已建 ' + (idx.ready || 0) + ' 个，失败 ' + idx.failed + ' 个') : '已就绪';
      const indexDetail = idx
        ? `已完成 ${idx.ready || 0} / ${idx.documents || 0} 个文件，待建 ${idx.pending || 0}${idx.failed ? `，失败 ${idx.failed}` : ''}`
        : '';
      return h(
        'div',
        { style: { padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '820px' } },
        h('h2', { style: { fontSize: '17px', margin: 0 } }, '本地搜索设置'),
        h('p', { style: note }, '这里控制检索输出、题库位置和索引位置。只改输出不会重建索引；修改题库/索引路径并保存后会自动开始建库。'),
        h(
          'div',
          { style: card },
          h('p', { style: title }, '数据库与索引库位置'),
          h(
            Field,
            { note: '题库/数据库文件夹的绝对路径。填好后新会话会自动使用，不再先问路径；留空则仍需在对话里提供。' },
            h('span', { style: label }, '题库位置'),
            h('input', {
              type: 'text',
              style: { ...input, width: '100%' },
              value: settings.libraryRoot || '',
              onChange: (e) => update({ libraryRoot: e.target.value }),
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
                  h('p', { style: { ...note, opacity: 0.9 } }, indexLabel + ' · ' + indexDetail + (idx.error ? '：' + idx.error : '')),
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
                  h('p', { style: note }, `索引大小：${formatBytes(idx.cacheBytes)} · 已索引 ${idx.ready || 0} / ${idx.documents || 0} 个文件${idx.failed ? ` · 失败 ${idx.failed}` : ''}`),
                  idx.cacheDir ? h('p', { style: { ...note, wordBreak: 'break-all' } }, '索引目录：' + idx.cacheDir) : null,
                  h(
                    'div',
                    { style: { display: 'flex', gap: '8px', marginTop: '2px' } },
                    h('button', { type: 'button', style: button, disabled: indexBusy, onClick: loadIndex }, '刷新状态'),
                    h('button', { type: 'button', style: primary, disabled: indexBusy || idx.running || !settings.libraryRoot, onClick: buildIndex }, idx.running ? '建库中…' : '开始/继续建库'),
                  ),
                ),
        ),
        h(
          'div',
          { style: card },
          h('p', { style: title }, '搜索步骤（按顺序执行，可单独关闭）'),
          h('p', { style: note }, '一次工具调用内按 1 → 2 → 3/4/5 → 6 → 7 → 8 → 9 → 10 执行；每个启用的步骤只执行 1 次，不会自动二次补搜。只开 1–2 步＝最低花费；3/4/5 全开＝最全但更贵。'),
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
              h('input', { type: 'checkbox', style: checkbox, checked: allFiles, onChange: (e) => update({ normalMaxFiles: e.target.checked ? 'all' : 25 }) }),
              h('span', { style: { fontSize: '13px' } }, '全部'),
              h('input', {
                type: 'number', min: 1, max: 5000, style: input, disabled: allFiles,
                value: allFiles ? '' : num(settings.normalMaxFiles, 25),
                onChange: (e) => update({ normalMaxFiles: num(e.target.value, 1) }),
              }),
            ),
            h(
              Field,
              { note: '直接命中的文件，每个最多列几处；总数仍会显示“另有 N 处未显示”。' },
              h('span', { style: label }, '原词检索·每文件位置数'),
              h('input', { type: 'number', min: 1, max: 50, style: input, value: num(settings.normalMaxBlocksPerFile, 4), onChange: (e) => update({ normalMaxBlocksPerFile: num(e.target.value, 1) }) }),
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
            { index: 3, note: '执行 1 次，与第 2 步合并扫描。模型自检：主题有没有“人 / 旧称 / 缩写 / 别名”？有就填 1 个专名，没有就留空；不要填父类/领域词。工具会检查广度，过宽或非最窄的降级，不会二次搜索。' },
            h('input', { type: 'checkbox', style: checkbox, checked: settings.enableStrong !== false, onChange: (e) => update({ enableStrong: e.target.checked }) }),
            h('span', { style: { fontSize: '13px' } }, '强关联词'),
            h('span', { style: { ...label, minWidth: 'auto' } }, '上限'),
            h('input', { type: 'number', min: 0, max: 4, style: input, value: num(settings.strongLimit, 1), onChange: (e) => update({ strongLimit: Math.max(0, num(e.target.value, 1)) }) }),
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
              { note: '默认保留规则：超过直接命中文件数的 2 倍，或全库占比超过 20%，或以领域词结尾，任一即降级；只保留最窄的 1 个强关联词。' },
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
            h(
              Field,
              { note: '强关联词命中的文件单独使用这些输出上限，不与第 4/5 步共用。' },
              h('span', { style: label }, '强关联输出·最多文件数'),
              h('input', { type: 'checkbox', style: checkbox, checked: strongAll, onChange: (e) => update({ strongMaxFiles: e.target.checked ? 'all' : 6 }) }),
              h('span', { style: { fontSize: '13px' } }, '全部'),
              h('input', { type: 'number', min: 1, max: 5000, style: input, disabled: strongAll, value: strongAll ? '' : num(settings.strongMaxFiles, 6), onChange: (e) => update({ strongMaxFiles: num(e.target.value, 6) }) }),
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
              h('input', { type: 'number', min: 20, max: 400, style: input, value: num(settings.strongSnippetChars, 45), onChange: (e) => update({ strongSnippetChars: num(e.target.value, 45) }) }),
            ),
          ),
          h(
            Step,
            { index: 4, note: '执行 1 次，与第 2 步合并扫描。插件内置词表（有机→烃/醇/醛…）；开启后需要设置“关联词数量上限”，输出共用下方“关联词输出”上限。' },
            h('input', { type: 'checkbox', style: checkbox, checked: settings.expand !== false, onChange: (e) => update({ expand: e.target.checked }) }),
            h('span', { style: { fontSize: '13px' } }, '自动关联词扩展（词表）'),
            h('span', { style: { ...label, minWidth: 'auto' } }, '数量'),
            h('input', { type: 'number', min: 1, max: 8, style: input, value: num(settings.associationLimit, 4), onChange: (e) => update({ associationLimit: num(e.target.value, 4) }) }),
          ),
          h(
            Field,
            { note: '每行一个：关键词=关联词1,关联词2。同一个关键词的自定义词优先，剩余名额用内置词表补齐；不相关的自定义词不会参与检索。' },
            h('span', { style: label }, '自定义词表'),
            h('textarea', {
              style: { ...input, width: '100%', minHeight: '78px', fontFamily: 'inherit', resize: 'vertical' },
              value: customText,
              onChange: (event) => {
                setCustomText(event.target.value);
                update({ customAssociations: parseAssocText(event.target.value) });
              },
            }),
          ),
          h(
            'div',
            { style: { paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '8px' } },
            h(
              Field,
              { note: '第 4 步（自动词表）或第 5 步（一般关联）触发时共用：最多列多少文件；勾选“全部”不按文件数截断。普通原词检索不用它。' },
              h('span', { style: label }, '关联词输出·最多文件数'),
              h('input', { type: 'checkbox', style: checkbox, checked: assocAll, onChange: (e) => update({ expandMaxFiles: e.target.checked ? 'all' : 20 }) }),
              h('span', { style: { fontSize: '13px' } }, '全部'),
              h('input', { type: 'number', min: 1, max: 5000, style: input, disabled: assocAll, value: assocAll ? '' : num(settings.expandMaxFiles, 20), onChange: (e) => update({ expandMaxFiles: num(e.target.value, 1) }) }),
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
              h('input', { type: 'number', min: 20, max: 400, style: input, value: num(settings.expandSnippetChars, 45), onChange: (e) => update({ expandSnippetChars: num(e.target.value, 20) }) }),
            ),
          ),
          h(
            Step,
            { index: 5, note: '执行 1 次，与第 2 步合并扫描。模型补充的一般关联词；与第 4 步共用“关联词数量上限”和下方“关联词输出”上限。它不会新增文件，只在已命中原词的文件里补段落，避免“纯碱”这类泛词爆炸。' },
            h('input', { type: 'checkbox', style: checkbox, checked: settings.enableGeneral !== false, onChange: (e) => update({ enableGeneral: e.target.checked }) }),
            h('span', { style: { fontSize: '13px' } }, '一般关联词'),
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
        h(
          'div',
          { style: card },
          h('p', { style: title }, '最终输出'),
          h(
            Field,
            { note: '所有类别合计最多输出多少个文件。有上限时先保留直接命中，再自动扩展，最后强关联；默认全部。' },
            h('span', { style: label }, '最终输出文件数'),
            h('input', { type: 'checkbox', style: checkbox, checked: finalAll, onChange: (e) => update({ finalMaxFiles: e.target.checked ? 'all' : 75 }) }),
            h('span', { style: { fontSize: '13px' } }, '全部'),
            h('input', { type: 'number', min: 1, max: 5000, style: input, disabled: finalAll, value: finalAll ? '' : num(settings.finalMaxFiles, 75), onChange: (e) => update({ finalMaxFiles: num(e.target.value, 75) }) }),
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
          { style: { display: 'flex', gap: '10px', alignItems: 'center' } },
          h('button', { type: 'button', style: primary, disabled: busy, onClick: save }, busy ? '保存中…' : '保存'),
          h('button', { type: 'button', style: button, disabled: busy || !defaults, onClick: () => defaults && setSettings({ ...defaults }) }, '恢复默认'),
          status ? h('span', { style: { fontSize: '12px', opacity: 0.8 } }, status) : null,
        ),
      );
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('settings.section', () =>
          ctx.slots.register({ name: 'settings.section', id: 'folder-search', order: 50, label: '本地搜索设置' }, Page),
        );
      },
    };
  },
});
