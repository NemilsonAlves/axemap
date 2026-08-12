param(
  [int]$Port = 3001,
  [switch]$Dev   # usa pnpm dev em vez do dist compilado
)

$ErrorActionPreference = 'Stop'

# ── Para processo existente na porta ─────────────────────────────────────────
$existing = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
foreach ($conn in $existing) {
  Write-Host "Parando processo existente na porta $Port (PID $($conn.OwningProcess))..."
  Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 1

# ── Variáveis de ambiente obrigatórias ───────────────────────────────────────
$env:DATABASE_URL        = "postgresql://axemap:axemap_dev@127.0.0.1:5432/axemap_dev"
$env:REDIS_HOST          = "127.0.0.1"
$env:REDIS_PORT          = "6379"
$env:NODE_ENV            = "development"
$env:JWT_SECRET          = "axemap_jwt_secret_dev"
$env:JWT_REFRESH_SECRET  = "axemap_refresh_secret_dev"
$env:JWT_EXPIRES_IN      = "15m"
$env:JWT_REFRESH_EXPIRES = "7d"
$env:PORT                = "$Port"

# ── Execução ─────────────────────────────────────────────────────────────────
if ($Dev) {
  Write-Host "Iniciando API em modo DEV (pnpm dev)..."
  Set-Location (Join-Path (Get-Location) 'apps\api')
  pnpm dev
} else {
  Write-Host "Iniciando API (build compilado) na porta $Port..."
  node apps/api/dist/main.js
}
