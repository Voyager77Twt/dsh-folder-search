import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("      const finalAll = settings.finalMaxFiles === 'all' || Number(settings.finalMaxFiles) >= 5000;","      const finalAll = settings.finalMaxFiles === 'all' || Number(settings.finalMaxFiles) >= 5000;\n      const customMode = settings.searchMode === 'custom';");
const marker=`          h('p', { style: title }, '搜索步骤（按顺序执行，可单独关闭）'),
          h('p', { style: note }, '一次工具调用内按 1 → 2 → 3/4/5 → 6 → 7 → 8 → 9 → 10 执行；每个启用的步骤只执行 1 次，不会自动二次补搜。只开 1–2 步＝最低花费；3/4/5 全开＝最全但更贵。'),`;
const modeBlock=`          h('p', { style: title }, '搜索步骤（按顺序执行，可单独关闭）'),
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
            ? '只做原词检索：强关联、自动词表、一般关联、兜底全部关闭。'
            : (settings.searchMode || 'default') === 'full'
              ? '原词 + 强关联 + 自动词表 + 一般关联全部开启；文件上限尽量放开，输出可能很大。'
              : (settings.searchMode || 'default') === 'custom'
                ? '展开下方步骤，可逐项调整。'
                : '按当前已保存的本机设置执行；需要修改时切到「自定义搜索」。'),
          h(
            'div',
            { style: { display: customMode ? 'flex' : 'none', flexDirection: 'column', gap: '0px' } },`;
if(!c.includes(marker)) throw new Error('steps header marker missing');
c=c.replace(marker,modeBlock);
const closeMarker=`          ),
        ),
        h(
          'div',
          { style: card },
          h('p', { style: title }, '最终输出'),`;
const closeNew=`          ),
          ),
        ),
        h(
          'div',
          { style: card },
          h('p', { style: title }, '最终输出'),`;
if(!c.includes(closeMarker)) throw new Error('steps close marker missing');
c=c.replace(closeMarker,closeNew);
fs.writeFileSync(p,c,"utf8");
console.log("mode UI");
