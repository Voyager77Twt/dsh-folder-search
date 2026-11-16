import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
const marker=`          h(
            Field,
            { note: '索引缓存目录。留空使用默认 %LOCALAPPDATA%\\\\dsh-library-search；保存时会自动迁移并删除旧索引，目标已有同名索引则跳过并保留旧目录。' },`;
const add=`          ...((settings.libraryRoots?.length || 0) > 1 ? [h(
            Field,
            { note: '多个题库时决定默认搜索范围：全部库直接聚合；询问时模型会先让你选择题库，不会自行猜。' },
            h('span', { style: label }, '搜索范围'),
            h(
              'select',
              {
                style: { ...input, minWidth: '220px' },
                value: settings.librarySearchScope === 'ask' ? 'ask' : 'all',
                onChange: (e) => update({ librarySearchScope: e.target.value === 'ask' ? 'ask' : 'all' }),
              },
              h('option', { value: 'all' }, '全部库中搜索'),
              h('option', { value: 'ask' }, '搜索前询问我'),
            ),
          )] : []),
          h(
            Field,
            { note: '索引缓存目录。留空使用默认 %LOCALAPPDATA%\\\\dsh-library-search；保存时会自动迁移并删除旧索引，目标已有同名索引则跳过并保留旧目录。' },`;
if(!c.includes(marker)) throw new Error('cache field marker'); c=c.replace(marker,add);
const start=c.indexOf("    const EN = "); const end=c.indexOf("\n    const isEnglish",start);
const en=JSON.parse(c.slice(start+"    const EN = ".length,end).trim().replace(/;$/,''));
Object.assign(en,{
  '多个题库时决定默认搜索范围：全部库直接聚合；询问时模型会先让你选择题库，不会自行猜。':'Choose the default search scope when multiple libraries exist: search all, or ask before searching.',
  '搜索范围':'Search scope',
  '全部库中搜索':'Search all libraries',
  '搜索前询问我':'Ask before searching'
});
c=c.slice(0,start)+"    const EN = "+JSON.stringify(en,null,2)+";"+c.slice(end);
fs.writeFileSync(p,c,"utf8");
console.log("multi-library scope UI");
