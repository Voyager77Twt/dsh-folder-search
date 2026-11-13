import fs from "node:fs";
let p="lib/util.js"; let c=fs.readFileSync(p,"utf8");
const anchor=`/**
 * Locate the ripgrep binary.`;
const helper=`/**
 * Pick a PowerShell executable that can automate the installed Office.
 * A 32-bit Office cannot load its COM type library from 64-bit PowerShell
 * (0x80029C4A TYPE_E_CANTLOADLIBRARY), so use SysWOW64 PowerShell when only
 * 32-bit Office is installed.
 */
let cachedPowershell;
export function powershellCommand() {
  if (cachedPowershell) return cachedPowershell;
  if (process.platform !== 'win32') return (cachedPowershell = 'powershell.exe');
  const sysRoot = process.env.SystemRoot || process.env.windir || 'C:\\\\Windows';
  const programFiles = process.env.ProgramFiles || 'C:\\\\Program Files';
  const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\\\Program Files (x86)';
  const officeRoots = (base) => [
    path.join(base, 'Microsoft Office', 'root', 'Office16'),
    path.join(base, 'Microsoft Office', 'Office16'),
    path.join(base, 'Microsoft Office', 'Office15'),
    path.join(base, 'Microsoft Office', 'Office14'),
  ];
  const office32 = officeRoots(programFilesX86).some((dir) => exists(path.join(dir, 'WINWORD.EXE')) || exists(path.join(dir, 'POWERPNT.EXE')));
  const office64 = officeRoots(programFiles).some((dir) => exists(path.join(dir, 'WINWORD.EXE')) || exists(path.join(dir, 'POWERPNT.EXE')));
  const powershell32 = path.join(sysRoot, 'SysWOW64', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  cachedPowershell = office32 && !office64 && exists(powershell32) ? powershell32 : 'powershell.exe';
  return cachedPowershell;
}

`;
if(!c.includes("export function powershellCommand")) c=c.replace(anchor, helper+anchor);
fs.writeFileSync(p,c,"utf8");
for (const file of ["lib/legacy-batch.js","lib/office-convert.js"]) {
  let s=fs.readFileSync(file,"utf8");
  if(file.endsWith("legacy-batch.js")) s=s.replace("import { sha1, toPosix, exists } from './util.js';","import { sha1, toPosix, exists, powershellCommand } from './util.js';");
  else s=s.replace("import { exists } from './util.js';","import { exists, powershellCommand } from './util.js';");
  s=s.replace(/spawn\(\s*'powershell\.exe',/g,"spawn(powershellCommand(),");
  s=s.replace(/'powershell\.exe',\n      \['-NoProfile'/g,"powershellCommand(),\n      ['-NoProfile'");
  fs.writeFileSync(file,s,"utf8");
}
console.log("office bitness detection");
