param(
  [int]$Port = 3001
)

$ErrorActionPreference = 'Stop'

$existing = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
foreach ($conn in $existing) {
  $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$($conn.OwningProcess)" -ErrorAction SilentlyContinue
  if ($proc -and $proc.CommandLine -match 'api/dist/main\.js') {
    Write-Host "Parando API existente (PID $($conn.OwningProcess))..."
    Stop-Process -Id $conn.OwningProcess -Force
  }
}
Start-Sleep -Seconds 1

$ts = Get-Date -Format 'yyyyMMdd-HHmmss'
$logDir = Join-Path $env:TEMP 'opencode'
$out = Join-Path $logDir "api-$ts.out.log"
$err = Join-Path $logDir "api-$ts.err.log"

$psi = [System.Diagnostics.ProcessStartInfo]::new()
$psi.FileName = 'cmd.exe'
$cmd = 'set "DATABASE_URL=postgresql://axemap:axemap_dev@127.0.0.1:5432/axemap_dev" && '
$cmd += 'set "REDIS_HOST=127.0.0.1" && set "REDIS_PORT=6379" && set "NODE_ENV=development" && '
$cmd += 'node apps/api/dist/main.js > "' + $out + '" 2> "' + $err + '"'
$psi.Arguments = '/c ' + $cmd
$psi.WorkingDirectory = (Get-Location).Path
$psi.UseShellExecute = $true
$psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden

$p = [System.Diagnostics.Process]::Start($psi)

Write-Host "API iniciada: PID $($p.Id) (logs: $out)"
