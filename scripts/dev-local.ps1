#!/usr/bin/env pwsh
# AxéMap - Desenvolvimento local sem Docker
# Sobe PostgreSQL portatil (.pgdata) + Redis, roda migrate/seed e inicia API + Web
param(
    [switch]$SkipMigrate,
    [switch]$SkipSeed,
    [switch]$SkipStart
)

$ErrorActionPreference = "Stop"

$rootDir = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$pgBin   = Join-Path $rootDir '.pgportable\bin'
$pgData  = Join-Path $rootDir '.pgdata'
$pgPort  = 5432
$dbUser  = 'axemap'
$dbPass  = 'axemap_dev'
$dbName  = 'axemap_dev'

$redisServer = 'C:\ProgramData\chocolatey\bin\redis-server.exe'
$redisPort   = 6379

function Info([string]$m) { Write-Host "  $m" -ForegroundColor Cyan }
function Done([string]$m) { Write-Host "  $m" -ForegroundColor Green }
function Warn([string]$m) { Write-Host "  $m" -ForegroundColor Yellow }
function Fail([string]$m)  { Write-Host "  $m" -ForegroundColor Red; exit 1 }

function Test-TcpPort([int]$port) {
    try { $c = Get-NetConnection -State Listen -LocalPort $port -ErrorAction Stop; return ($null -ne $c) }
    catch { return $false }
}

function pg-exe([string]$name) { Join-Path $pgBin "$name.exe" }

# ---------- 1. PostgreSQL portátil ----------
Write-Host "=== AxeMap Local (sem Docker) ===" -ForegroundColor Cyan

if (-not (Test-Path (pg-exe 'postgres'))) {
    Fail "PostgreSQL portatil nao encontrado em $pgBin"
}

Write-Host "[1/6] PostgreSQL" -ForegroundColor Cyan
if (-not (Test-Path (Join-Path $pgData 'PG_VERSION'))) {
    if (-not (Test-Path $pgData)) { New-Item -ItemType Directory -Path $pgData -Force | Out-Null }
    Info "Inicializando cluster em $pgData ..."
    & (pg-exe 'initdb') -D $pgData -U $dbUser -E UTF8 --no-locale --auth=trust 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { Fail "initdb falhou." }
    Done "Cluster inicializado."
}

if (-not (Test-TcpPort $pgPort) -and -not (Test-Path (Join-Path $pgData 'postmaster.pid'))) {
    Info "Iniciando PostgreSQL na porta $pgPort ..."
    $logFile = Join-Path $pgData 'postgres.log'
    & (pg-exe 'pg_ctl') -D $pgData -l $logFile -o "-p $pgPort" -w start 2>&1 | Out-Null
    Start-Sleep -Seconds 2
    if (-not (Test-TcpPort $pgPort)) { Fail "PostgreSQL nao subiu. Veja $logFile" }
    Done "PostgreSQL ativo na porta $pgPort."
} else {
    Done "PostgreSQL ja ativo na porta $pgPort."
}

# Garantir senha do usuario e database
$env:PGPASSWORD = ''
$env:PGHOST = '127.0.0.1'
$env:PGPORT = "$pgPort"

& (pg-exe 'psql') -h 127.0.0.1 -p $pgPort -U $dbUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$dbName'" | Out-Null
$exists = & (pg-exe 'psql') -h 127.0.0.1 -p $pgPort -U $dbUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$dbName'"
if ("$exists".Trim() -ne '1') {
    Info "Criando database $dbName ..."
    & (pg-exe 'createdb') -h 127.0.0.1 -p $pgPort -U $dbUser $dbName
    if ($LASTEXITCODE -ne 0) { Fail "createdb falhou." }
    Done "Database $dbName criado."
} else {
    Done "Database $dbName ja existe."
}

# ---------- 2. Redis ----------
Write-Host "[2/6] Redis" -ForegroundColor Cyan
if (-not (Test-TcpPort $redisPort)) {
    if (-not (Test-Path $redisServer)) {
        Warn "redis-server nao encontrado em $redisServer. Continuando sem Redis (health degradado)."
    } else {
        Info "Iniciando Redis na porta $redisPort ..."
        Start-Process -FilePath $redisServer -ArgumentList "--port","$redisPort","--daemonize","yes" -WindowStyle Hidden | Out-Null
        Start-Sleep -Seconds 1
        if (Test-TcpPort $redisPort) { Done "Redis ativo na porta $redisPort." }
        else { Warn "Redis nao respondeu. Continuando sem Redis." }
    }
} else {
    Done "Redis ja ativo na porta $redisPort."
}

# ---------- 3. Prisma generate ----------
Write-Host "[3/6] Prisma generate" -ForegroundColor Cyan
Push-Location (Join-Path $rootDir 'packages\database')
try {
    & npx prisma generate 2>&1 | Select-Object -Last 3
} finally { Pop-Location }

# ---------- 4. Migrations ----------
if (-not $SkipMigrate) {
    Write-Host "[4/6] Migrations" -ForegroundColor Cyan
    Push-Location (Join-Path $rootDir 'packages\database')
    try {
        & npx prisma migrate deploy 2>&1 | Select-Object -Last 5
    } finally { Pop-Location }
}

# ---------- 5. Seed ----------
if (-not $SkipSeed) {
    Write-Host "[5/6] Seed" -ForegroundColor Cyan
    Push-Location (Join-Path $rootDir 'packages\database')
    try {
        & npx prisma db seed 2>&1 | Select-Object -Last 5
    } finally { Pop-Location }
}

# ---------- 6. API + Web ----------
if ($SkipStart) {
    Warn "PostgreSQL e Redis prontos. API/Web nao iniciados (-SkipStart)."
    return
}

Write-Host "[6/6] Iniciando API e Web" -ForegroundColor Cyan
Push-Location (Join-Path $rootDir 'apps\api')
$api = Start-Process pwsh -ArgumentList '-NoExit','-Command','pnpm dev' -PassThru
Pop-Location
Push-Location (Join-Path $rootDir 'apps\web')
$web = Start-Process pwsh -ArgumentList '-NoExit','-Command','pnpm dev' -PassThru
Pop-Location

Write-Host "  API -> http://localhost:3001" -ForegroundColor Cyan
Write-Host "  Web -> http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Feche estas janelas (ou Ctrl+C aqui) para parar." -ForegroundColor Yellow

while ($true) {
    Start-Sleep -Seconds 2
    if ($api.HasExited) { Warn "API encerrada (codigo $($api.ExitCode))." }
    if ($web.HasExited) { Warn "Web encerrada (codigo $($web.ExitCode))." }
}