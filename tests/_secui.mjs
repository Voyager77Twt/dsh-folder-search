import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
const marker=`        h(
          'div',
          { style: { display: 'flex', gap: '10px', alignItems: 'center' } },
          h('button', { type: 'button', style: primary, disabled: busy, onClick: save }, busy ? '保存中…' : '保存'),`;
const security=`        h(
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
${marker}`;
if(!c.includes(marker)) throw new Error('security insertion marker missing');
c=c.replace(marker,security);
fs.writeFileSync(p,c,"utf8");
console.log("security UI");
