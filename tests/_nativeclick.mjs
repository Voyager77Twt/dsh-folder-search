import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
const marker="      const save = async () => {";
const effect=`      React.useEffect(() => {
        if (typeof document === 'undefined') return undefined;
        const element = document.getElementById('folder-search-pick');
        if (!element) return undefined;
        const handler = (event) => {
          event.preventDefault();
          selectFolder();
        };
        element.addEventListener('click', handler);
        return () => element.removeEventListener('click', handler);
      }, [settings, libraryText, folderPicking]);

${marker}`;
if(!c.includes(marker)) throw new Error('effect marker'); c=c.replace(marker,effect);
c=c.replace("h('button', {\n                type: 'button',\n                style: { ...button, opacity: folderPicking ? 0.65 : 1 },","h('button', {\n                id: 'folder-search-pick',\n                type: 'button',\n                style: { ...button, opacity: folderPicking ? 0.65 : 1 },");
fs.writeFileSync(p,c,"utf8");
console.log("native click listener");
