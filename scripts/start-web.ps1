param(
  [int]$Port = 3000
)

$ErrorActionPreference = 'Stop'

$existing = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
foreach ($conn in $existing) {
  $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$($conn.OwningProcess)" -ErrorAction SilentlyContinue
  if ($proc -and $proc.CommandLine -match 'next') {
    Write-Host "Parando web existente (PID $($conn.OwningProcess))..."
    Stop-Process -Id $conn.OwningProcess -Force
  }
}
Start-Sleep -Seconds 1

$ts = Get-Date -Format 'yyyyMMdd-HHmmss'
$logDir = Join-Path $env:TEMP 'opencode'
$out = Join-Path $logDir "web-$ts.out.log"
$err = Join-Path $logDir "web-$ts.err.log"

$psi = [System.Diagnostics.ProcessStartInfo]::new()
$psi.FileName = 'cmd.exe'
$cmd = 'set "NODE_ENV=development" && set "PORT=' + $Port + '" && set "NEXTAUTH_URL=http://localhost:' + $Port + '" && '
$cmd += 'pnpm --filter @axemap/web exec next dev -p ' + $Port + ' > "' + $out + '" 2> "' + $err + '"'
$psi.Arguments = '/c ' + $cmd
$psi.WorkingDirectory = (Get-Location).Path
$psi.UseShellExecute = $true
$psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden

$p = [System.Diagnostics.Process]::Start($psi)

Write-Host "Web iniciada: PID $($p.Id) (logs: $out)"
