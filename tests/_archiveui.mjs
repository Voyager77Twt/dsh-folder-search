import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
const marker=`          h(
            Field,
            { note: '单个文件抽取出的文本字符上限（MB 按字符计）。' },`;
const add=`          h(
            Field,
            { note: '压缩包最多递归解压多少层；超过后只跳过更深层的压缩包。' },
            h('span', { style: label }, '压缩包最大深度'),
            h('input', { type: 'number', min: 1, max: 10, style: input, value: num(settings.archiveMaxDepth, 2), onChange: (e) => update({ archiveMaxDepth: Math.max(1, Math.min(10, num(e.target.value, 2))) }) }),
          ),
          h(
            Field,
            { note: '一个压缩包及其所有嵌套压缩包合计最多允许多少个条目。' },
            h('span', { style: label }, '嵌套树最大条目数'),
            h('input', { type: 'number', min: 100, max: 100000, style: input, value: num(settings.archiveTreeMaxEntries, 10000), onChange: (e) => update({ archiveTreeMaxEntries: Math.max(100, Math.min(100000, num(e.target.value, 10000))) }) }),
          ),
          h(
            Field,
            { note: '一个压缩包及其所有嵌套压缩包合计最多解压多少 MB。' },
            h('span', { style: label }, '嵌套树总解压上限（MB）'),
            h('input', { type: 'number', min: 32, max: 8192, style: input, value: num(settings.archiveTreeMaxMB, 1024), onChange: (e) => update({ archiveTreeMaxMB: Math.max(32, Math.min(8192, num(e.target.value, 1024))) }) }),
          ),
          h(
            Field,
            { note: '单个文件抽取出的文本字符上限（MB 按字符计）。' },`;
if(!c.includes(marker)) throw new Error('security insertion marker'); c=c.replace(marker,add);
// EN map add keys
const start=c.indexOf("    const EN = "); const end=c.indexOf("\n    const isEnglish",start);
const en=JSON.parse(c.slice(start+"    const EN = ".length,end).trim().replace(/;$/,''));
Object.assign(en,{
  '压缩包最大深度':'Max archive depth',
  '压缩包最多递归解压多少层；超过后只跳过更深层的压缩包。':'Maximum archive nesting depth; deeper archives are skipped.',
  '嵌套树最大条目数':'Max entries in nested tree',
  '一个压缩包及其所有嵌套压缩包合计最多允许多少个条目。':'Total entries allowed across one archive and all nested archives.',
  '嵌套树总解压上限（MB）':'Nested tree total extracted cap (MB)',
  '一个压缩包及其所有嵌套压缩包合计最多解压多少 MB。':'Total uncompressed MB allowed across one archive and all nested archives.'
});
c=c.slice(0,start)+"    const EN = "+JSON.stringify(en,null,2)+";"+c.slice(end);
fs.writeFileSync(p,c,"utf8");
console.log("archive UI");
