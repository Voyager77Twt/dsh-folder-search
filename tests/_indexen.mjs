import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
const old=`      const indexPercent = idx?.documents ? Math.min(100, Math.round(((idx.ready || 0) / idx.documents) * 100)) : 0;
      const indexLabel = !idx ? '读取中…' : idx.phase === 'legacy' ? \`旧版转换中：已转 \${idx.legacyConverted || 0}，本批 \${idx.legacyPending || 0} 个\${idx.legacyCurrent ? '（' + String(idx.legacyCurrent).split('/').pop() + '）' : ''}\` : idx.running ? '建库中…' : idx.pending > 0 ? ('待建 ' + idx.pending + ' 个文件') : idx.failed > 0 ? ('已建 ' + (idx.ready || 0) + ' 个，失败 ' + idx.failed + ' 个') : '已就绪';
      const indexDetail = idx
        ? \`已完成 \${idx.ready || 0} / \${idx.documents || 0} 个文件，待建 \${idx.pending || 0}\${idx.failed ? \`，失败 \${idx.failed}\` : ''}\`
        : '';`;
const neu=`      const english = isEnglish();
      const indexPercent = idx?.documents ? Math.min(100, Math.round(((idx.ready || 0) / idx.documents) * 100)) : 0;
      const indexLabel = !idx
        ? (english ? 'Reading…' : '读取中…')
        : idx.phase === 'legacy'
          ? (english
            ? \`Converting legacy: \${idx.legacyConverted || 0}, batch \${idx.legacyPending || 0}\${idx.legacyCurrent ? ' (' + String(idx.legacyCurrent).split('/').pop() + ')' : ''}\`
            : \`旧版转换中：已转 \${idx.legacyConverted || 0}，本批 \${idx.legacyPending || 0} 个\${idx.legacyCurrent ? '（' + String(idx.legacyCurrent).split('/').pop() + '）' : ''}\`)
          : idx.running
            ? (english ? 'Indexing…' : '建库中…')
            : idx.pending > 0
              ? (english ? \`Pending \${idx.pending} files\` : \`待建 \${idx.pending} 个文件\`)
              : idx.failed > 0
                ? (english ? \`Indexed \${idx.ready || 0}, failed \${idx.failed}\` : \`已建 \${idx.ready || 0} 个，失败 \${idx.failed} 个\`)
                : (english ? 'Ready' : '已就绪');
      const indexDetail = idx
        ? (english
          ? \`Completed \${idx.ready || 0} / \${idx.documents || 0} files, pending \${idx.pending || 0}\${idx.failed ? \`, failed \${idx.failed}\` : ''}\`
          : \`已完成 \${idx.ready || 0} / \${idx.documents || 0} 个文件，待建 \${idx.pending || 0}\${idx.failed ? \`，失败 \${idx.failed}\` : ''}\`)
        : '';`;
if(!c.includes(old)) throw new Error('index label marker missing');
c=c.replace(old,neu);
c=c.replace("h('p', { style: { ...note, opacity: 0.9 } }, indexLabel + ' · ' + indexDetail + (idx.error ? '：' + idx.error : '')),","h('p', { style: { ...note, opacity: 0.9 } }, indexLabel + ' · ' + indexDetail + (idx.error ? (english ? ': ' : '：') + idx.error : '')),");
const oldSize="h('p', { style: note }, `索引大小：${formatBytes(idx.cacheBytes)} · 已索引 ${idx.ready || 0} / ${idx.documents || 0} 个文件${idx.failed ? ` · 失败 ${idx.failed}` : ''}`)";
const newSize="h('p', { style: note }, english ? `Index size: ${formatBytes(idx.cacheBytes)} · Indexed ${idx.ready || 0} / ${idx.documents || 0} files${idx.failed ? ` · failed ${idx.failed}` : ''}` : `索引大小：${formatBytes(idx.cacheBytes)} · 已索引 ${idx.ready || 0} / ${idx.documents || 0} 个文件${idx.failed ? ` · 失败 ${idx.failed}` : ''}`)";
if(!c.includes(oldSize)) throw new Error('size marker missing');
c=c.replace(oldSize,newSize);
c=c.replace("idx.cacheDir ? h('p', { style: { ...note, wordBreak: 'break-all' } }, '索引目录：' + idx.cacheDir) : null,","idx.cacheDir ? h('p', { style: { ...note, wordBreak: 'break-all' } }, (english ? 'Index directory: ' : '索引目录：') + idx.cacheDir) : null,");
fs.writeFileSync(p,c,"utf8");
console.log("index status english");
