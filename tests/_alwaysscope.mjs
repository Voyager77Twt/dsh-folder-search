import fs from "node:fs";
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  base.librarySearchScope = source.librarySearchScope === 'ask' ? 'ask' : 'all';","  base.librarySearchScope = base.libraryRoots.length > 1 && source.librarySearchScope === 'ask' ? 'ask' : 'all';");
fs.writeFileSync(p,c,"utf8");
p="lib/client.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("      const customMode = settings.searchMode === 'custom';","      const customMode = settings.searchMode === 'custom';\n      const multipleLibraries = (settings.libraryRoots?.length || 0) > 1;");
const old=String.raw`          ...((settings.libraryRoots?.length || 0) > 1 ? [h(
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
          )] : []),`;
const neu=String.raw`          h(
            Field,
            { note: multipleLibraries
              ? '多个题库时决定默认搜索范围：全部库直接聚合；询问时模型会先让你选择题库。用户在问题中明确指定题库时，以用户指定为准。'
              : '配置两个以上题库后可选择；只有一个题库或尚未配置时固定为全部搜索。' },
            h('span', { style: label }, '搜索范围'),
            h(
              'select',
              {
                style: { ...input, minWidth: '220px', opacity: multipleLibraries ? 1 : 0.5, cursor: multipleLibraries ? 'pointer' : 'not-allowed' },
                disabled: !multipleLibraries,
                value: multipleLibraries && settings.librarySearchScope === 'ask' ? 'ask' : 'all',
                onChange: (e) => update({ librarySearchScope: e.target.value === 'ask' ? 'ask' : 'all' }),
              },
              h('option', { value: 'all' }, '全部库中搜索'),
              h('option', { value: 'ask' }, multipleLibraries ? '搜索前询问我' : '搜索前询问我（需两个以上题库）'),
            ),
          ),`;
if(!c.includes(old)) throw new Error('scope block marker'); c=c.replace(old,neu);
const start=c.indexOf("    const EN = "); const end=c.indexOf("\n    const isEnglish",start);
const en=JSON.parse(c.slice(start+"    const EN = ".length,end).trim().replace(/;$/,''));
Object.assign(en,{
  '多个题库时决定默认搜索范围：全部库直接聚合；询问时模型会先让你选择题库。用户在问题中明确指定题库时，以用户指定为准。':'Choose the default scope for multiple libraries: search all, or ask first. An explicitly named library still wins.',
  '配置两个以上题库后可选择；只有一个题库或尚未配置时固定为全部搜索。':'Available with two or more libraries; with one or none, search all is fixed.',
  '搜索前询问我（需两个以上题库）':'Ask before searching (needs 2+ libraries)'
});
c=c.slice(0,start)+"    const EN = "+JSON.stringify(en,null,2)+";"+c.slice(end);
fs.writeFileSync(p,c,"utf8");
console.log("always-visible grey scope");
