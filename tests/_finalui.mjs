import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("      const strongAll = settings.strongMaxFiles === 'all' || Number(settings.strongMaxFiles) >= 5000;","      const strongAll = settings.strongMaxFiles === 'all' || Number(settings.strongMaxFiles) >= 5000;\n      const finalAll = settings.finalMaxFiles === 'all' || Number(settings.finalMaxFiles) >= 5000;");
const marker=`        h(
          'div',
          { style: card },
          h('p', { style: title }, '目录输出'),`;
const finalCard=`        h(
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
${marker}`;
if(!c.includes(marker)) throw new Error('directory marker missing');
c=c.replace(marker,finalCard);
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.16"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
fs.writeFileSync("README.md",fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.15`","- 版本：`0.5.16`"),"utf8");
console.log("final output UI");
