param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputPath,
  [int]$Format = 17
)

$ErrorActionPreference = 'Stop'
$word = $null
$doc = $null
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  try { $word.Options.ConfirmConversions = $false } catch { }
  $doc = $word.Documents.Open($InputPath, $false, $true)
  $doc.SaveAs([ref]$OutputPath, [ref]$Format)
  $doc.Close($false)
  $doc = $null
  Write-Output 'OK'
}
catch {
  Write-Error $_.Exception.Message
  exit 1
}
finally {
  if ($doc) { try { $doc.Close($false) } catch { } }
  if ($word) { try { $word.Quit() } catch { } }
}
