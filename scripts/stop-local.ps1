#!/usr/bin/env pwsh
# AxeMap - Para os processos locais (PostgreSQL portatil + Redis + API/Web)
param(
    [switch]$KeepDb
)

$ErrorActionPreference = "SilentlyContinue"

$rootDir = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$pgBin   = Join-Path $rootDir '.pgportable\bin'
$pgData  = Join-Path $rootDir '.pgdata'

Write-Host "=== Parando AxeMap (local) ===" -ForegroundColor Cyan

# API / Web (pnpm dev / nest / next)
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -match 'nest start|next dev|pnpm dev' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force; Write-Host "  parado PID $($_.ProcessId)" }

# Redis
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -match 'redis-server' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force; Write-Host "  Redis parado (PID $($_.ProcessId))" }

# PostgreSQL - apenas se -KeepDb nao for passado
if (-not $KeepDb) {
    & (Join-Path $pgBin 'pg_ctl.exe') -D $pgData stop -m fast -w 2>&1 | ForEach-Object { Write-Host "  $_" }
    Write-Host "PostgreSQL parado." -ForegroundColor Green
} else {
    Write-Host "PostgreSQL mantido (-KeepDb)." -ForegroundColor Yellow
}

Write-Host "Concluido." -ForegroundColor Green