#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# preflight-vps.sh — Verificação pré-deploy no VPS (Contabo / Linux)
#
# Roda no servidor, ANTES do primeiro deploy e em cada go-live.
# Requisitos mínimos recomendados (Contabo):
#   CPU >= 2 vCPU · RAM >= 4 GB · Disco >= 30 GB livres · Ubuntu 22.04/24.04
#
# Uso:
#   bash scripts/preflight-vps.sh
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

pass() { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; }

echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}              AXÉMAP — VPS PREFLIGHT                        ${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"

echo -e "\n${YELLOW}[1/12] Identificação${NC}"
echo "Hostname: $(hostname 2>/dev/null || echo '?')"
echo "OS: $(lsb_release -ds 2>/dev/null || grep PRETTY_NAME /etc/os-release 2>/dev/null | cut -d= -f2 | tr -d '"' || echo '?')"
echo "Kernel: $(uname -r 2>/dev/null || echo '?')"

echo -e "\n${YELLOW}[2/12] CPU${NC}"
CPUS=$(nproc 2>/dev/null || echo 0)
echo "vCPU: $CPUS"
[ "$CPUS" -ge 2 ] && pass "CPU suficiente (>= 2 vCPU)" || fail "CPU baixa (< 2 vCPU) — recomendado >= 2"

echo -e "\n${YELLOW}[3/12] RAM${NC}"
free -h 2>/dev/null || echo "free não disponível"
RAM_MB=$(awk '/MemTotal/{printf "%d", $2/1024}' /proc/meminfo 2>/dev/null || echo 0)
[ "$RAM_MB" -ge 4096 ] && pass "RAM suficiente (>= 4 GB)" || warn "RAM baixa (< 4 GB) — recomendado >= 4 GB"

echo -e "\n${YELLOW}[4/12] Disco${NC}"
df -h / 2>/dev/null || echo "df não disponível"
DISK_GB=$(df -k / 2>/dev/null | awk 'NR==2{printf "%d", $4/1024/1024}' || echo 0)
[ "$DISK_GB" -ge 30 ] && pass "Disco suficiente (>= 30 GB livres)" || warn "Disco livre < 30 GB"

echo -e "\n${YELLOW}[5/12] Swap${NC}"
SWAP_MB=$(awk '/SwapTotal/{printf "%d", $2/1024}' /proc/meminfo 2>/dev/null || echo 0)
[ "$SWAP_MB" -ge 2048 ] && pass "Swap OK ($((SWAP_MB / 1024)) GB)" || warn "Sem swap suficiente (>= 2 GB recomendado)"

echo -e "\n${YELLOW}[6/12] Docker Engine${NC}"
docker --version 2>/dev/null && pass "Docker instalado" || fail "Docker NÃO instalado"
docker info --format 'Storage: {{.Driver}} · Cgroup: {{.CgroupDriver}}' 2>/dev/null || true

echo -e "\n${YELLOW}[7/12] Docker Compose${NC}"
docker compose version 2>/dev/null && pass "Compose instalado" || fail "Docker Compose NÃO instalado"

echo -e "\n${YELLOW}[8/12] Serviço Docker${NC}"
sudo systemctl is-active docker 2>/dev/null | grep -q active && pass "docker.service ativo" || fail "docker.service inativo"

echo -e "\n${YELLOW}[9/12] Firewall (UFW)${NC}"
sudo ufw status 2>/dev/null || echo "ufw não instalado/sem permissão"
echo "  Esperado: Allow 22 · 80 · 443 (e 5432/6379 apenas via 127.0.0.1 se necessário)"

echo -e "\n${YELLOW}[10/12] Fail2ban${NC}"
sudo systemctl is-active fail2ban 2>/dev/null | grep -q active && pass "fail2ban ativo" || warn "fail2ban inativo ou não instalado"

echo -e "\n${YELLOW}[11/12] Portas 80/443 em escuta${NC}"
if command -v ss >/dev/null 2>&1; then
  ss -tlnp 2>/dev/null | grep -E ':(80|443)\b' && pass "80/443 em escuta" || warn "Nenhum serviço em 80/443 (nginx subirá no deploy)"
else
  echo "ss não disponível — verifique manualmente (netstat -tlnp | grep -E ':(80|443)')"
fi

echo -e "\n${YELLOW}[12/12] Diretório de deploy${NC}"
if [ -d /opt/axemap ]; then
  ls -ld /opt/axemap && pass "Diretório /opt/axemap existe" || true
else
  warn "Diretório /opt/axemap NÃO existe — será criado pelo roteiro de deploy"
fi

echo -e "\n${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}              PREFLIGHT CONCLUÍDO                            ${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"