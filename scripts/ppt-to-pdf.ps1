param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputPath
)

$ErrorActionPreference = 'Stop'
$ppt = $null
$pres = $null
try {
  $ppt = New-Object -ComObject PowerPoint.Application
  # ppSaveAsPDF = 32
  $pres = $ppt.Presentations.Open($InputPath, $true, $false, $false)
  $pres.SaveAs($OutputPath, 32)
  $pres.Close()
  $pres = $null
  Write-Output 'OK'
}
catch {
  Write-Error $_.Exception.Message
  exit 1
}
finally {
  if ($pres) { try { $pres.Close() } catch { } }
  if ($ppt) { try { $ppt.Quit() } catch { } }
}
