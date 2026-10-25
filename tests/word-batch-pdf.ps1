param(
  [Parameter(Mandatory = $true)][string]$ListPath,
  [Parameter(Mandatory = $true)][string]$OutDir
)

$ErrorActionPreference = 'Stop'
$items = Get-Content -LiteralPath $ListPath -Raw -Encoding UTF8 | ConvertFrom-Json
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$word = $null
$ok = 0
$fail = 0
$errors = @()
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  try { $word.Options.ConfirmConversions = $false } catch { }
  foreach ($item in $items) {
    $doc = $null
    try {
      $doc = $word.Documents.Open($item.src, $false, $true)
      $doc.SaveAs([ref]$item.out, [ref]17)
      $doc.Close($false)
      $doc = $null
      $ok++
    }
    catch {
      $fail++
      $errors += [pscustomobject]@{ src = $item.src; error = $_.Exception.Message }
      if ($doc) { try { $doc.Close($false) } catch { } }
    }
  }
}
finally {
  if ($word) { try { $word.Quit() } catch { } }
}
Write-Output "ok=$ok fail=$fail"
$errors | ConvertTo-Json -Compress | Set-Content -LiteralPath (Join-Path $OutDir 'errors.json') -Encoding UTF8
