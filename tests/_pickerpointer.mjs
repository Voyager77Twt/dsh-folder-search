import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("const PICK_API = '/api/dsh-folder-search/pick-folder';","const PICK_API = '/api/dsh-folder-search/pick-folder';\nlet pickerRequestOpen = false;");
c=c.replace("      const selectFolder = async () => {\n        setFolderPicking(true);","      const selectFolder = async () => {\n        if (pickerRequestOpen) return;\n        pickerRequestOpen = true;\n        setFolderPicking(true);");
c=c.replace("        } finally {\n          setFolderPicking(false);\n        }\n      };","        } finally {\n          pickerRequestOpen = false;\n          setFolderPicking(false);\n        }\n      };");
c=c.replace("h('button', { type: 'button', style: button, disabled: busy || folderPicking, onClick: selectFolder }, folderPicking ? '选择中…' : '选择文件夹')","h('button', {\n                type: 'button',\n                style: { ...button, opacity: folderPicking ? 0.65 : 1 },\n                onMouseDown: (event) => { if (event.button === 0) { event.preventDefault(); selectFolder(); } },\n                onClick: (event) => { event.preventDefault(); selectFolder(); },\n              }, folderPicking ? '选择中…' : '选择文件夹')");
fs.writeFileSync(p,c,"utf8");
console.log("picker pointer events");
