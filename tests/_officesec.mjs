import fs from "node:fs";
for (const file of ["scripts/word-batch-to-pdf.ps1","scripts/word-to-pdf.ps1","scripts/ppt-to-pdf.ps1"]) {
  let s=fs.readFileSync(file,"utf8");
  if(!s.includes("[switch]$AllowMacros")) s=s.replace("param(\n","param(\n  [switch]$AllowMacros,\n");
  if(file.includes("word-batch")){
    s=s.replace("  $word.DisplayAlerts = 0\n  try { $word.Options.ConfirmConversions = $false } catch { }","  $word.DisplayAlerts = 0\n  if (-not $AllowMacros) { try { $word.AutomationSecurity = 3 } catch { } }\n  try { $word.Options.UpdateLinksAtOpen = $false } catch { }\n  try { $word.Options.ConfirmConversions = $false } catch { }");
  } else if(file.includes("word-to-pdf")){
    s=s.replace("  $word.DisplayAlerts = 0\n  try { $word.Options.ConfirmConversions = $false } catch { }","  $word.DisplayAlerts = 0\n  if (-not $AllowMacros) { try { $word.AutomationSecurity = 3 } catch { } }\n  try { $word.Options.UpdateLinksAtOpen = $false } catch { }\n  try { $word.Options.ConfirmConversions = $false } catch { }");
  } else {
    s=s.replace("  $ppt = New-Object -ComObject PowerPoint.Application\n  # ppSaveAsPDF = 32","  $ppt = New-Object -ComObject PowerPoint.Application\n  if (-not $AllowMacros) { try { $ppt.AutomationSecurity = 3 } catch { } }\n  # ppSaveAsPDF = 32");
  }
  fs.writeFileSync(file,s,"utf8");
}
let p="lib/office-convert.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("      powershellCommand(),\n      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', SCRIPT, '-InputPath', inputPath, '-OutputPath', outputPdf],\n      timeoutMs,","      powershellCommand(),\n      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', SCRIPT, '-InputPath', inputPath, '-OutputPath', outputPdf, ...(options.allowMacros ? ['-AllowMacros'] : [])],\n      timeoutMs,");
c=c.replace("      powershellCommand(),\n      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', PPT_SCRIPT, '-InputPath', inputPath, '-OutputPath', outputPdf],\n      timeoutMs,","      powershellCommand(),\n      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', PPT_SCRIPT, '-InputPath', inputPath, '-OutputPath', outputPdf, ...(options.allowMacros ? ['-AllowMacros'] : [])],\n      timeoutMs,");
fs.writeFileSync(p,c,"utf8");
p="lib/legacy-batch.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("function runOnce(listPath, outDir, timeoutMs) {","function runOnce(listPath, outDir, timeoutMs, allowMacros = false) {");
c=c.replace("['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', SCRIPT, '-ListPath', listPath, '-OutDir', outDir],","['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', SCRIPT, '-ListPath', listPath, '-OutDir', outDir, ...(allowMacros ? ['-AllowMacros'] : [])],");
c=c.replace("export async function preconvertLegacy(index, items) {","export async function preconvertLegacy(index, items, options = {}) {");
c=c.replace("const { timedOut } = await runOnce(listPath, dir, timeout);","const { timedOut } = await runOnce(listPath, dir, timeout, options.allowMacros === true);");
fs.writeFileSync(p,c,"utf8");
console.log("office security switches");
