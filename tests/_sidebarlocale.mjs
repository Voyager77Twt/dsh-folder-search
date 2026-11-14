import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
const old=`      inject: ['slots', 'locale'],
      apply(ctx) {
        localeFace = ctx.locale || (typeof ctx.get === 'function' ? ctx.get('locale') : null);
        if (localeFace?.getLocale) activeLocale = localeFace.getLocale().active;
        else if (typeof document !== 'undefined' && document.documentElement?.lang) activeLocale = document.documentElement.lang;
        ctx.slots.inject('settings.section', () =>
          ctx.slots.register({ name: 'settings.section', id: 'folder-search', order: 50, label: () => tr('本地搜索设置') }, Page),
        );
      },`;
const neu=`      inject: ['slots', 'locale'],
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
      },`;
if(!c.includes(old)) throw new Error('apply marker missing');
c=c.replace(old,neu);
fs.writeFileSync(p,c,"utf8");
console.log("sidebar locale registration");
