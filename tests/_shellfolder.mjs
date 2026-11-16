import fs from "node:fs";
let p="lib/settings-host.js"; let c=fs.readFileSync(p,"utf8");
const old=`  const script = [
    'Add-Type -AssemblyName System.Windows.Forms',
    '$dialog = New-Object System.Windows.Forms.FolderBrowserDialog',
    "$dialog.Description = 'Select library folder'",
    '$dialog.ShowNewFolderButton = $true',
    'if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; [Console]::Out.Write($dialog.SelectedPath) }',
  ].join('; ');`;
const neu=`  const script = [
    '$shell = New-Object -ComObject Shell.Application',
    "$folder = $shell.BrowseForFolder(0, 'Select library folder', 0)",
    'if ($null -ne $folder) { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; [Console]::Out.Write($folder.Self.Path) }',
  ].join('; ');`;
if(!c.includes(old)) throw new Error('dialog script marker'); c=c.replace(old,neu);
fs.writeFileSync(p,c,"utf8");
console.log("shell folder dialog");
