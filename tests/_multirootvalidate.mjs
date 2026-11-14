import fs from "node:fs";
let p="lib/settings-host.js"; let c=fs.readFileSync(p,"utf8");
const old=`          if (!settings.libraryRoot) {
            send(response, 400, { error: '请先填写并保存题库位置' });
            return;
          }
          const stat = await fs.stat(settings.libraryRoot);
          if (!stat.isDirectory()) {
            send(response, 400, { error: '题库位置不是文件夹：' + settings.libraryRoot });
            return;
          }`;
const neu=`          const roots = (Array.isArray(settings.libraryRoots) && settings.libraryRoots.length ? settings.libraryRoots : [settings.libraryRoot]).filter(Boolean);
          if (!roots.length) {
            send(response, 400, { error: '请先填写并保存题库位置' });
            return;
          }
          for (const root of roots) {
            const stat = await fs.stat(root).catch(() => null);
            if (!stat?.isDirectory()) {
              send(response, 400, { error: '题库位置不是文件夹：' + root });
              return;
            }
          }`;
if(!c.includes(old)) throw new Error('validation marker'); c=c.replace(old,neu);
fs.writeFileSync(p,c,"utf8");
console.log("multi path validation");
