import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
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

`;
if(!c.includes(effect)) throw new Error('native effect marker'); c=c.replace(effect,'');
c=c.replace("                id: 'folder-search-pick',\n                type: 'button',","                id: 'folder-search-pick',\n                type: 'button',\n                ref: (element) => { if (element) element.onclick = (event) => { event.preventDefault(); selectFolder(); }; },");
fs.writeFileSync(p,c,"utf8");
console.log("remove conditional hook, use ref binding");
