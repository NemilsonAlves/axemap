# Troubleshooting - AxéMap

## Problemas Comuns e Soluções

### 1. Porta 3000 já em uso

O sintoma mais comum: o `next dev` do AxéMap falha com `EADDRINUSE` na porta 3000, mas o `netstat` do Windows não mostra nenhum `LISTENING`.

**Causa:** com o WSL2 em *mirrored networking*, containers Docker de **outros projetos** que rodam dentro do WSL ocupam a porta e ficam **invisíveis** no netstat do Windows.

```powershell
# Descobrir quem segura a porta (dentro do WSL)
wsl -e sh -c "ss -tlnp | grep ':3000'"

# Solução: pare o container concorrente (ex: NutriScan)
wsl -e sh -c "docker stop nutriscan-frontend"
```

Para o Windows puro (sem WSL), a verificação é via `netstat -ano | findstr :3000`.

### 2. Banco não conecta

```bash
make doctor
# Verificar container
docker ps | grep axemap-postgres
# Verificar bind
ss -tlnp "sport = :5432"
# Testar conexão
docker exec -it axemap-postgres pg_isready -U axemap -d axemap_dev
```

### 3. Redis não conecta

```bash
docker exec -it axemap-redis redis-cli ping
# Deve retornar: PONG
```

### 4. Prisma Client não encontrado

```bash
cd packages/database && npx prisma generate
```

### 5. Porta não acessível do Windows

1. Verifique se o serviço está bindado em `0.0.0.0`:
   ```bash
   ss -tlnp "sport = :3000"
   # Deve mostrar: 0.0.0.0:3000
   ```
2. Teste do Windows:
   ```powershell
   Test-NetConnection -ComputerName localhost -Port 3000
   ```
3. Se estiver usando VPN (Tailscale, etc.), desative temporariamente

### 6. WSL perdeu conectividade

```powershell
# PowerShell (Admin)
wsl --shutdown
wsl
```

### 7. Mirrored Networking não funciona

Requisitos:
- Windows 11 22H2+ (Build 22621+)
- WSL 2.1.0+
- Virtual Machine Platform ativada

```powershell
dism /online /enable-feature /featurename:VirtualMachinePlatform /all
```

### 8. Migrations pendentes

```bash
cd packages/database
npx prisma migrate dev
```

### 9. Seed falha

```bash
cd packages/database
npx prisma db seed
# Se falhar, verifique o seed log
```

### 10. API/Kernel panic no WSL

```bash
# Se o WSL travar com erro de kernel:
wsl --shutdown
# No PowerShell (Admin):
net stop LxssManager
net start LxssManager
wsl
```

## Logs

```bash
docker compose logs -f          # Logs de todos containers
docker compose logs postgres    # Logs do PostgreSQL
docker compose logs redis       # Logs do Redis
```
