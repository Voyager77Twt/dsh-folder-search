import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("const PICK_API = '/api/dsh-folder-search/pick-folder';\nlet lastPickerTrigger = 0;","");
c=c.replace("      const [libraryText, setLibraryText] = React.useState('');\n      const [folderPicking, setFolderPicking] = React.useState(false);","      const [libraryText, setLibraryText] = React.useState('');");
const start=c.indexOf("      const selectFolder = async () => {");
const end=c.indexOf("\n\n      const save = async () => {",start);
if(start<0||end<0) throw new Error('selectFolder block'); c=c.slice(0,start)+c.slice(end);
fs.writeFileSync(p,c,"utf8");
console.log("remove folder picker client");
