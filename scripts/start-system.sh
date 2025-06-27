# Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
# Criado do zero por mim. Removal of this notice is prohibited for 10 years.

#!/bin/bash

# Script de inicialização do sistema SocialFI Ecosystem v2.0
# Suporte para Metis Sepolia Testnet e Ethereum Sepolia Testnet
# Autor: Sistema SocialFI
# Data: $(date +%Y-%m-%d)

set -e  # Parar execução em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variáveis globais
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_PID=""
FRONTEND_PID=""
HARDHAT_PID=""

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"
}

# Função para verificar pré-requisitos
check_prerequisites() {
    log "🔍 Verificando pré-requisitos do sistema..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js não está instalado. Instale Node.js 18+ primeiro."
        exit 1
    fi
    
    local node_version=$(node --version | sed 's/v//')
    local major_version=$(echo $node_version | cut -d. -f1)
    
    if [ "$major_version" -lt 18 ]; then
        error "Node.js versão 18+ é necessário. Versão atual: $node_version"
        exit 1
    fi
    
    log "Node.js versão $node_version detectado ✅"
    
    # Verificar netcat para health checks
    if ! command -v nc &> /dev/null; then
        warning "netcat não encontrado. Instalando..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y netcat
        elif command -v yum &> /dev/null; then
            sudo yum install -y nc
        else
            warning "Não foi possível instalar netcat automaticamente"
        fi
    fi
}

# Função para criar arquivos de ambiente
create_env_files() {
    log "🔧 Verificando e criando arquivos de ambiente para MULTI-TESTNET (Metis + Ethereum Sepolia)..."
    
    # Criar .env-dev para o backend
    if [ ! -f "$PROJECT_ROOT/backend/.env-dev" ]; then
        log "Criando arquivo .env-dev para o backend (MULTI-TESTNET)..."
        
        cat > "$PROJECT_ROOT/backend/.env-dev" << 'EOF'
# Configuração do Backend - MULTI-TESTNET (Metis + Ethereum Sepolia)
NODE_ENV=development
PORT=3002
CORS_ORIGIN=http://localhost:3001

# Autenticação
JWT_SECRET=your-jwt-secret-change-in-production
JWT_EXPIRES_IN=24h

# Logging
LOG_LEVEL=info

# Blockchain - MULTI-TESTNET
CHAIN_ID=133717
NETWORK_NAME=metis_sepolia
RPC_URL=https://hyperion-testnet.metisdevops.link

# APIs Externas
ALCHEMY_API_KEY=YOUR_ALCHEMY_API_KEY
METIS_API_KEY=YOUR_METIS_API_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
METIS_EXPLORER_API_KEY=YOUR_METIS_EXPLORER_API_KEY

# Contratos (Multi-Testnet) - Substitua pelos endereços reais após deploy
TRUST_CHAIN_ADDRESS=0x...
TRADE_CONNECT_ADDRESS=0x...
GOV_GAME_ADDRESS=0x...
REWARDS_TOKEN_ADDRESS=0x...
ECOSYSTEM_HUB_ADDRESS=0x...

# Chaves (NUNCA COMMIT CHAVES REAIS!)
PRIVATE_KEY=YOUR_PRIVATE_KEY_FOR_TESTNET_ONLY

# WebSocket
SOCKET_PATH=/socket.io
SOCKET_PORT=3003
EOF
    fi
    
    # Criar .env-dev para o frontend
    if [ ! -f "$PROJECT_ROOT/frontend/.env-dev" ]; then
        log "Criando arquivo .env-dev para o frontend (MULTI-TESTNET)..."
        
        cat > "$PROJECT_ROOT/frontend/.env-dev" << 'EOF'
# Configuração do Frontend - MULTI-TESTNET (Metis + Ethereum Sepolia)
NEXT_PUBLIC_CHAIN_ID=133717
NEXT_PUBLIC_NETWORK_NAME=metis_sepolia
NEXT_PUBLIC_RPC_URL=https://hyperion-testnet.metisdevops.link

# Alchemy para Ethereum Sepolia
NEXT_PUBLIC_ALCHEMY_API_KEY=YOUR_ALCHEMY_API_KEY
NEXT_PUBLIC_ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# Endereços dos Contratos (Multi-Testnet) - Substitua pelos endereços reais após deploy
NEXT_PUBLIC_TRUST_CHAIN_ADDRESS=0x...
NEXT_PUBLIC_TRADE_CONNECT_ADDRESS=0x...
NEXT_PUBLIC_GOV_GAME_ADDRESS=0x...
NEXT_PUBLIC_REWARDS_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_ECOSYSTEM_HUB_ADDRESS=0x...

# Configuração da API
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_SOCKET_URL=http://localhost:3002

# Wallet Connect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_WALLET_CONNECT_PROJECT_ID

# Configuração de Internacionalização
NEXT_PUBLIC_DEFAULT_LOCALE=pt-BR
NEXT_PUBLIC_SUPPORTED_LOCALES=["pt-BR", "en"]

# Configuração de Tema
NEXT_PUBLIC_DEFAULT_THEME=dark

# Configurações da Aplicação
NEXT_PUBLIC_APP_NAME=SocialFI
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Configurações da API
NEXT_PUBLIC_API_VERSION=v1

# Configurações do Socket.io
NEXT_PUBLIC_SOCKET_PATH=/socket.io

# Configurações da Blockchain
NEXT_PUBLIC_DEFAULT_CHAIN=metis_sepolia

# Configurações de Analytics (opcional)
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token

# CoinMarketCap
NEXT_PUBLIC_COINMARKETCAP_API_KEY=YOUR_COINMARKETCAP_API_KEY

# Explorers
NEXT_PUBLIC_METIS_EXPLORER_URL=https://hyperion-testnet-explorer.metisdevops.link
NEXT_PUBLIC_ETHERSCAN_URL=https://sepolia.etherscan.io
EOF
    fi
    
    # Criar .env-dev para Hardhat
    if [ ! -f "$PROJECT_ROOT/.env-dev" ]; then
        log "Criando arquivo .env-dev para Hardhat (MULTI-TESTNET)..."
        
        cat > "$PROJECT_ROOT/.env-dev" << 'EOF'
# Configurações da Rede - MULTI-TESTNET (Metis + Ethereum Sepolia)
NETWORK=metis_sepolia
CHAIN_ID=133717

# RPC URLs
METIS_RPC_URL=https://hyperion-testnet.metisdevops.link
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
RPC_URL=https://hyperion-testnet.metisdevops.link

# Chaves (NUNCA COMMIT CHAVES REAIS!)
PRIVATE_KEY=YOUR_PRIVATE_KEY_FOR_TESTNET_ONLY

# APIs Externas
ALCHEMY_API_KEY=YOUR_ALCHEMY_API_KEY
METIS_API_KEY=YOUR_METIS_API_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
METIS_EXPLORER_API_KEY=YOUR_METIS_EXPLORER_API_KEY
COINMARKETCAP_API_KEY=YOUR_COINMARKETCAP_API_KEY

# Configurações do Node
NODE_ENV=development
PORT=3001
JWT_SECRET=your-jwt-secret-change-in-production
SOCKET_PORT=3002

# Frontend URLs
NEXT_PUBLIC_BACKEND_URL=http://localhost:3002
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3002
NEXT_PUBLIC_CHAIN_ID=133717
EOF
    fi

    # Avisar sobre segurança
    warning "🔒 ATENÇÃO: Configure suas chaves privadas e APIs nos arquivos .env-dev"
    warning "🔒 NUNCA faça commit de chaves reais no repositório!"
    warning "🔒 Use apenas chaves de testnet com valores pequenos!"
}

# Função para verificar configurações de testnet
verify_testnet_config() {
    log "🔍 Verificando configurações de MULTI-TESTNET (Metis + Ethereum Sepolia)..."
    
    local config_ok=true
    
    # Verificar Hardhat config
    if grep -q "chainId: 133717" "$PROJECT_ROOT/hardhat.config.js"; then
        log "✅ Hardhat configurado para Metis Sepolia (Chain ID: 133717)"
    else
        warning "⚠️  Hardhat pode não estar configurado para Metis Sepolia"
        config_ok=false
    fi
    
    if grep -q "chainId: 11155111" "$PROJECT_ROOT/hardhat.config.js"; then
        log "✅ Hardhat configurado para Ethereum Sepolia (Chain ID: 11155111)"
    else
        warning "⚠️  Hardhat pode não estar configurado para Ethereum Sepolia"
        config_ok=false
    fi
    
    # Verificar wagmi config
    if [ -f "$PROJECT_ROOT/frontend/src/config/wagmi.ts" ]; then
        if grep -q "133717" "$PROJECT_ROOT/frontend/src/config/wagmi.ts"; then
            log "✅ Frontend configurado para Metis Sepolia"
        else
            warning "⚠️  Frontend pode não estar configurado para Metis Sepolia"
            config_ok=false
        fi
        
        if grep -q "11155111" "$PROJECT_ROOT/frontend/src/config/wagmi.ts"; then
            log "✅ Frontend configurado para Ethereum Sepolia"
        else
            warning "⚠️  Frontend pode não estar configurado para Ethereum Sepolia"
            config_ok=false
        fi
    fi
    
    # Verificar se há chaves reais nos arquivos
    if [ -f "$PROJECT_ROOT/.env-dev" ]; then
        if grep -q "YOUR_" "$PROJECT_ROOT/.env-dev"; then
            log "✅ Arquivo .env-dev usa placeholders seguros"
        else
            error "❌ ATENÇÃO: .env-dev pode conter chaves reais!"
            warning "🔒 Substitua chaves reais por placeholders antes de fazer commit"
            config_ok=false
        fi
    fi
    
    if [ "$config_ok" = true ]; then
        log "✅ Sistema configurado corretamente para MULTI-TESTNET"
        log "🌐 Rede Principal: Metis Sepolia Testnet (Chain ID: 133717)"
        log "🌐 Rede Secundária: Ethereum Sepolia Testnet (Chain ID: 11155111)"
        log "🔗 Explorer Metis: https://hyperion-testnet-explorer.metisdevops.link"
        log "🔗 Explorer Ethereum: https://sepolia.etherscan.io"
    else
        warning "⚠️  Algumas configurações de testnet podem precisar de ajustes"
    fi
    
    warning "💡 LEMBRE-SE:"
    warning "💡 - Configure suas chaves de API nos arquivos .env-dev"
    warning "💡 - Use apenas chaves de testnet com pequenas quantias"
    warning "💡 - Nunca faça commit de chaves reais"
    warning "💡 - Obtenha tMETIS em: https://hyperion-testnet-explorer.metisdevops.link"
    warning "💡 - Obtenha ETH de testnet em: https://sepoliafaucet.com"
}

# Função para corrigir problemas nos testes e código
fix_test_issues() {
    log "Corrigindo problemas conhecidos nos testes e código..."
    
    # Corrigir problemas nos testes dos contratos (ethers v6)
    log "Corrigindo sintaxe do ethers v5 para v6 nos testes..."
    
    # Corrigir ethers.utils.parseEther para ethers.parseEther
    find "$PROJECT_ROOT/test" -name "*.test.js" -exec sed -i 's/ethers\.utils\.parseEther/ethers.parseEther/g' {} \;
    find "$PROJECT_ROOT/scripts" -name "*.js" -exec sed -i 's/ethers\.utils\.parseEther/ethers.parseEther/g' {} \;
    
    # Corrigir ethers.constants.AddressZero para ethers.ZeroAddress
    find "$PROJECT_ROOT/test" -name "*.test.js" -exec sed -i 's/ethers\.constants\.AddressZero/ethers.ZeroAddress/g' {} \;
    find "$PROJECT_ROOT/scripts" -name "*.js" -exec sed -i 's/ethers\.constants\.AddressZero/ethers.ZeroAddress/g' {} \;
    
    # Remover .deployed() calls e substituir por waitForDeployment()
    find "$PROJECT_ROOT/test" -name "*.test.js" -exec sed -i 's/await \([^.]*\)\.deployed();/await \1.waitForDeployment();/g' {} \;
    find "$PROJECT_ROOT/scripts" -name "*.js" -exec sed -i 's/await \([^.]*\)\.deployed();/await \1.waitForDeployment();/g' {} \;
    
    # Corrigir operações matemáticas com BigInt nos testes
    log "Corrigindo operações BigInt nos testes..."
    find "$PROJECT_ROOT/test" -name "*.test.js" -exec sed -i 's/\.add(1)/+ 1n/g' {} \;
    find "$PROJECT_ROOT/test" -name "*.test.js" -exec sed -i 's/\.sub(1)/- 1n/g' {} \;
    
    # Corrigir problemas específicos nos arquivos de tradução do frontend
    log "Verificando arquivos de tradução do frontend..."
    
    # Criar arquivos de tradução faltantes se necessário
    if [ ! -f "$PROJECT_ROOT/frontend/src/locales/pt-BR/common.json" ]; then
        mkdir -p "$PROJECT_ROOT/frontend/src/locales/pt-BR"
        cat > "$PROJECT_ROOT/frontend/src/locales/pt-BR/common.json" << 'EOF'
{
  "loading": "Carregando...",
  "error": "Erro",
  "success": "Sucesso",
  "connect": "Conectar",
  "disconnect": "Desconectar",
  "wallet": "Carteira",
  "balance": "Saldo",
  "address": "Endereço",
  "transaction": "Transação",
  "confirm": "Confirmar",
  "cancel": "Cancelar",
  "save": "Salvar",
  "edit": "Editar",
  "delete": "Excluir",
  "back": "Voltar",
  "next": "Próximo",
  "previous": "Anterior",
  "close": "Fechar",
  "open": "Abrir",
  "profile": "Perfil",
  "settings": "Configurações",
  "language": "Idioma",
  "theme": "Tema",
  "light": "Claro",
  "dark": "Escuro",
  "system": "Sistema"
}
EOF
    fi
    
    if [ ! -f "$PROJECT_ROOT/frontend/src/locales/en/common.json" ]; then
        mkdir -p "$PROJECT_ROOT/frontend/src/locales/en"
        cat > "$PROJECT_ROOT/frontend/src/locales/en/common.json" << 'EOF'
{
  "loading": "Loading...",
  "error": "Error",
  "success": "Success",
  "connect": "Connect",
  "disconnect": "Disconnect",
  "wallet": "Wallet",
  "balance": "Balance",
  "address": "Address",
  "transaction": "Transaction",
  "confirm": "Confirm",
  "cancel": "Cancel",
  "save": "Save",
  "edit": "Edit",
  "delete": "Delete",
  "back": "Back",
  "next": "Next",
  "previous": "Previous",
  "close": "Close",
  "open": "Open",
  "profile": "Profile",
  "settings": "Settings",
  "language": "Language",
  "theme": "Theme",
  "light": "Light",
  "dark": "Dark",
  "system": "System"
}
EOF
    fi
    
    log "Problemas conhecidos corrigidos com sucesso"
}

# Função para aguardar conclusão de processos com timeout inteligente
wait_for_completion() {
    local process_name=$1
    local timeout=${2:-300}  # 5 minutos padrão
    local check_interval=${3:-5}  # verificar a cada 5 segundos
    local counter=0
    
    log "⏳ Aguardando conclusão de: $process_name (timeout: ${timeout}s)"
    
    while [ $counter -lt $timeout ]; do
        # Verificar se ainda há processos npm/node rodando relacionados à instalação
        if ! pgrep -f "npm install" > /dev/null 2>&1; then
            log "✅ $process_name concluído em ${counter}s"
            return 0
        fi
        
        # Feedback visual a cada 30 segundos
        if [ $((counter % 30)) -eq 0 ] && [ $counter -gt 0 ]; then
            info "⏳ $process_name ainda em progresso... (${counter}/${timeout}s - $((counter/60))min)"
        fi
        
        sleep $check_interval
        counter=$((counter + check_interval))
    done
    
    error "❌ Timeout aguardando $process_name após ${timeout}s"
    return 1
}

# Função para aguardar processo específico terminar
wait_for_process_completion() {
    local pid=$1
    local process_name=$2
    local timeout=${3:-300}
    local counter=0
    
    log "⏳ Aguardando processo $process_name (PID: $pid) terminar..."
    
    while kill -0 $pid 2>/dev/null && [ $counter -lt $timeout ]; do
        if [ $((counter % 30)) -eq 0 ] && [ $counter -gt 0 ]; then
            info "⏳ $process_name ainda rodando... (${counter}/${timeout}s)"
        fi
        sleep 5
        counter=$((counter + 5))
    done
    
    if [ $counter -ge $timeout ]; then
        error "❌ Timeout aguardando $process_name após ${timeout}s"
        return 1
    fi
    
    log "✅ $process_name concluído em ${counter}s"
    return 0
}

# Função para instalar dependências com tratamento de erros
install_dependencies() {
    local dir=$1
    local name=$2
    
    log "📦 Instalando dependências em $name ($dir)..."
    cd "$dir" || exit 1
    
    # Verificar se package.json existe
    if [ ! -f "package.json" ]; then
        error "package.json não encontrado em $dir"
        exit 1
    fi
    
    # Limpar cache se necessário
    if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
        info "🧹 Limpando instalação anterior em $name..."
        rm -rf node_modules package-lock.json 2>/dev/null || true
    fi
    
    # Instalar dependências
    npm cache clean --force > /dev/null 2>&1 || true
    
    info "📥 Executando npm install em $name..."
    
    # Executar npm install em background para poder monitorar
    npm install --legacy-peer-deps --silent &
    local npm_pid=$!
    
    # Aguardar conclusão com timeout de 10 minutos para dependências
    if wait_for_process_completion $npm_pid "npm install ($name)" 600; then
        log "✅ Dependências instaladas com sucesso em $name"
    else
        error "❌ Falha ao instalar dependências em $name"
        exit 1
    fi
    
    # Compilar TypeScript se for backend
    if [[ $name == "backend" ]]; then
        log "🔨 Compilando TypeScript do backend..."
        if npm run build; then
            log "✅ Backend compilado com sucesso"
        else
            error "❌ Falha ao compilar o backend"
            exit 1
        fi
    fi
}

# Função para executar testes com relatório detalhado e timeout inteligente
run_tests() {
    log "🧪 Executando testes do sistema..."
    
    # Testes dos contratos
    info "🔬 Executando testes dos contratos inteligentes..."
    cd "$PROJECT_ROOT" || exit 1
    
    timeout 600 npm test > test-contracts.log 2>&1 &
    local contracts_test_pid=$!
    
    if wait_for_process_completion $contracts_test_pid "testes dos contratos" 600; then
        log "✅ Testes dos contratos: PASSOU"
        CONTRACTS_TEST_STATUS="PASSOU"
    else
        warning "⚠️  Testes dos contratos: FALHOU (verifique test-contracts.log)"
        CONTRACTS_TEST_STATUS="FALHOU"
    fi
    
    # Testes do backend
    info "🔬 Executando testes do backend..."
    cd "$PROJECT_ROOT/backend" || exit 1
    
    timeout 600 npm test > ../test-backend.log 2>&1 &
    local backend_test_pid=$!
    
    if wait_for_process_completion $backend_test_pid "testes do backend" 600; then
        log "✅ Testes do backend: PASSOU"
        BACKEND_TEST_STATUS="PASSOU"
    else
        warning "⚠️  Testes do backend: FALHOU (verifique test-backend.log)"
        BACKEND_TEST_STATUS="FALHOU"
    fi
    
    # Testes do frontend
    info "🔬 Executando testes do frontend..."
    cd "$PROJECT_ROOT/frontend" || exit 1
    
    timeout 600 npm test -- --passWithNoTests --silent > ../test-frontend.log 2>&1 &
    local frontend_test_pid=$!
    
    if wait_for_process_completion $frontend_test_pid "testes do frontend" 600; then
        log "✅ Testes do frontend: PASSOU"
        FRONTEND_TEST_STATUS="PASSOU"
    else
        warning "⚠️  Testes do frontend: FALHOU (verifique test-frontend.log)"
        FRONTEND_TEST_STATUS="FALHOU"
    fi
}

# Função para copiar ABIs dos contratos
copy_contract_abis() {
    log "📋 Copiando ABIs dos contratos..."
    
    # Compilar contratos primeiro se artifacts não existir
    if [ ! -d "$PROJECT_ROOT/artifacts/contracts" ]; then
        log "Compilando contratos..."
        cd "$PROJECT_ROOT" || exit 1
        if npm run compile; then
            log "✅ Contratos compilados com sucesso"
        else
            warning "⚠️  Falha ao compilar contratos"
            return 1
        fi
    fi
    
    mkdir -p "$PROJECT_ROOT/frontend/contracts/abis"
    
    if [ -d "$PROJECT_ROOT/artifacts/contracts" ]; then
        find "$PROJECT_ROOT/artifacts/contracts" -name "*.json" -not -path "*/test/*" -not -name "*.dbg.json" | while read -r file; do
            cp "$file" "$PROJECT_ROOT/frontend/contracts/abis/" 2>/dev/null || true
        done
        log "✅ ABIs copiados com sucesso"
    else
        warning "⚠️  Diretório de artifacts não encontrado após compilação"
    fi
}

# Função para verificar uma porta específica
check_port() {
    local port=$1
    if nc -z localhost $port 2>/dev/null; then
        warning "⚠️  Porta $port está em uso. Tentando liberar..."
        # Tentar matar processos na porta
        local pid=$(lsof -ti:$port 2>/dev/null)
        if [ ! -z "$pid" ]; then
            kill -9 $pid 2>/dev/null || true
            sleep 2
        fi
        # Verificar novamente
        if nc -z localhost $port 2>/dev/null; then
            warning "⚠️  Porta $port ainda está em uso. Continue mesmo assim."
        else
            log "✅ Porta $port liberada"
        fi
    else
        log "✅ Porta $port disponível"
    fi
}

# Função para verificar portas disponíveis
check_system_ports() {
    log "🔍 Verificando disponibilidade das portas..."
    check_port 3001 # Frontend
    check_port 3002 # Backend API
    check_port 3003 # Socket.IO
    log "✅ Portas verificadas e liberadas"
}

# Função para cleanup ao sair
cleanup() {
    log "🧹 Encerrando serviços..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        wait $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        wait $FRONTEND_PID 2>/dev/null || true
    fi
    log "🔚 Sistema encerrado"
    exit 0
}

# Função para detectar porta do frontend
detect_frontend_port() {
    local port=3001
    
    # Verificar se está rodando na porta 3000 (padrão Next.js)
    if nc -z localhost 3000 2>/dev/null; then
        port=3000
    elif nc -z localhost 3001 2>/dev/null; then
        port=3001
    fi
    
    echo $port
}

# Função para monitorar saúde dos serviços
monitor_services() {
    local backend_timeout=120  # 2 minutos para backend (tempo real observado)
    local frontend_timeout=300 # 5 minutos para frontend (tempo real observado: 3-5 min)
    local counter=0
    
    log "⏳ Aguardando inicialização dos serviços..."
    
    # Verificar se os processos foram iniciados corretamente
    if [ -z "$BACKEND_PID" ] || ! kill -0 $BACKEND_PID 2>/dev/null; then
        error "❌ Processo do backend não está rodando"
        return 1
    fi
    
    if [ -z "$FRONTEND_PID" ] || ! kill -0 $FRONTEND_PID 2>/dev/null; then
        error "❌ Processo do frontend não está rodando"
        return 1
    fi
    
    # Aguardar backend (5 minutos)
    log "🔧 Monitorando backend (timeout: ${backend_timeout}s / $((backend_timeout/60)) minutos)..."
    counter=0
    while ! nc -z localhost 3002 2>/dev/null && [ $counter -lt $backend_timeout ]; do
        # Verificar se o processo ainda está rodando
        if ! kill -0 $BACKEND_PID 2>/dev/null; then
            error "❌ Processo do backend parou de funcionar"
            warning "💡 Verifique o log: tail -f backend.log"
            return 1
        fi
        
        sleep 5
        counter=$((counter + 5))
        if [ $((counter % 60)) -eq 0 ]; then
            info "⏳ Aguardando backend... ($counter/${backend_timeout}s - $((counter/60))min)"
        fi
    done
    
    if [ $counter -ge $backend_timeout ]; then
        error "❌ Timeout ao aguardar backend iniciar após $((backend_timeout/60)) minutos"
        warning "💡 Verifique o log: tail -f backend.log"
        return 1
    fi
    
    log "✅ Backend iniciado com sucesso na porta 3002 em ${counter}s"
    
    # Testar se o backend responde
    if curl -s http://localhost:3002 >/dev/null 2>&1; then
        log "✅ Backend respondendo corretamente"
    else
        warning "⚠️  Backend iniciou mas pode não estar respondendo corretamente"
    fi
    
    # Aguardar frontend (5 minutos) - detectar porta automaticamente
    log "🎨 Monitorando frontend (timeout: ${frontend_timeout}s / $((frontend_timeout/60)) minutos)..."
    counter=0
    local frontend_port_found=false
    
    while [ $counter -lt $frontend_timeout ] && [ "$frontend_port_found" = false ]; do
        # Verificar se o processo ainda está rodando
        if ! kill -0 $FRONTEND_PID 2>/dev/null; then
            error "❌ Processo do frontend parou de funcionar"
            warning "💡 Verifique o log: tail -f frontend.log"
            return 1
        fi
        
        # Verificar porta 3001 primeiro, depois 3000
        if nc -z localhost 3001 2>/dev/null; then
            FRONTEND_PORT=3001
            frontend_port_found=true
        elif nc -z localhost 3000 2>/dev/null; then
            FRONTEND_PORT=3000
            frontend_port_found=true
        else
            sleep 5
            counter=$((counter + 5))
            if [ $((counter % 60)) -eq 0 ]; then
                info "⏳ Aguardando frontend... ($counter/${frontend_timeout}s - $((counter/60))min)"
            fi
        fi
    done
    
    if [ "$frontend_port_found" = false ]; then
        error "❌ Timeout ao aguardar frontend iniciar após $((frontend_timeout/60)) minutos"
        warning "💡 Frontend Next.js pode demorar mais na primeira inicialização"
        warning "💡 Verifique o log: tail -f frontend.log"
        return 1
    fi
    
    log "✅ Frontend iniciado com sucesso na porta ${FRONTEND_PORT} em ${counter}s"
    
    # Testar se o frontend responde
    if curl -s http://localhost:${FRONTEND_PORT} >/dev/null 2>&1; then
        log "✅ Frontend respondendo corretamente"
    else
        warning "⚠️  Frontend iniciou mas pode não estar respondendo corretamente"
    fi
    
    return 0
}

# Função para exibir relatório final
show_final_report() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}    🎉 SISTEMA INICIADO COM SUCESSO!    ${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Frontend:    http://localhost:${FRONTEND_PORT}${NC}"
    echo -e "${GREEN}Backend API: http://localhost:3002${NC}"
    echo -e "${GREEN}Socket.IO:   http://localhost:3002/socket.io${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${BLUE}📊 RELATÓRIO DE TESTES:${NC}"
    echo -e "${BLUE}  - Contratos: ${CONTRACTS_TEST_STATUS:-N/A}${NC}"
    echo -e "${BLUE}  - Backend:   ${BACKEND_TEST_STATUS:-N/A}${NC}"
    echo -e "${BLUE}  - Frontend:  ${FRONTEND_TEST_STATUS:-N/A}${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${YELLOW}📋 Logs disponíveis em:${NC}"
    echo -e "${YELLOW}  - Backend: $PROJECT_ROOT/backend.log${NC}"
    echo -e "${YELLOW}  - Frontend: $PROJECT_ROOT/frontend.log${NC}"
    echo -e "${YELLOW}  - Testes: $PROJECT_ROOT/test-*.log${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${BLUE}💡 Pressione CTRL+C para encerrar todos os serviços${NC}"
    echo -e "${GREEN}========================================${NC}"
}

# INÍCIO DO SCRIPT PRINCIPAL
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    SocialFI Ecosystem - Start System  ${NC}"
echo -e "${BLUE}    Versão 2.0 - Sistema Melhorado     ${NC}"
echo -e "${BLUE}========================================${NC}"

# Registrar handler para CTRL+C
trap cleanup SIGINT SIGTERM

# Verificar se estamos no diretório correto
if [ ! -f "$PROJECT_ROOT/package.json" ] || [ ! -d "$PROJECT_ROOT/contracts" ]; then
    error "❌ Diretório do projeto inválido. Execute o script a partir da raiz do projeto SocialFI Ecosystem."
    exit 1
fi

# 1. Verificar pré-requisitos
log "🔍 Verificando pré-requisitos do sistema..."
check_prerequisites

# 2. Verificar e criar arquivos de ambiente
create_env_files

# 2.1. Verificar configurações de testnet
verify_testnet_config

# 3. Verificar e copiar arquivos de ambiente
log "📁 Configurando arquivos de ambiente..."
for dir in "backend" "frontend"; do
    if [ ! -f "$PROJECT_ROOT/$dir/.env" ]; then
        if [ -f "$PROJECT_ROOT/$dir/.env-dev" ]; then
            cp "$PROJECT_ROOT/$dir/.env-dev" "$PROJECT_ROOT/$dir/.env"
            log "✅ Arquivo .env criado para $dir"
        else
            warning "⚠️  Arquivo .env-dev não encontrado para $dir"
        fi
    else
        log "✅ Arquivo .env já existe para $dir"
    fi
done

# 4. Verificar portas
check_system_ports

# 5. Corrigir problemas conhecidos
fix_test_issues

# 6. Copiar ABIs dos contratos
copy_contract_abis

# 7. Instalar dependências
log "📦 Instalando dependências..."
install_dependencies "$PROJECT_ROOT" "contratos"
install_dependencies "$PROJECT_ROOT/backend" "backend"
install_dependencies "$PROJECT_ROOT/frontend" "frontend"

# 8. Executar testes
run_tests

# 9. Iniciar serviços
log "🚀 Iniciando serviços..."

# Iniciar backend
log "🔧 Iniciando backend..."
cd "$PROJECT_ROOT/backend" || exit 1
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
log "Backend iniciado com PID: $BACKEND_PID"

# Aguardar um pouco antes de iniciar o frontend
sleep 3

# Iniciar frontend
log "🎨 Iniciando frontend..."
cd "$PROJECT_ROOT/frontend" || exit 1
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
log "Frontend iniciado com PID: $FRONTEND_PID"

# 10. Monitorar inicialização
log "🔄 Monitorando inicialização dos serviços..."
if monitor_services; then
    show_final_report
else
    error "❌ Falha na inicialização dos serviços"
    cleanup
    exit 1
fi

# 12. Monitorar processos continuamente
log "🔄 Monitorando processos..."
while true; do
    if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
        error "❌ Backend parou de responder (PID: $BACKEND_PID)"
        cleanup
        exit 1
    fi
    if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
        error "❌ Frontend parou de responder (PID: $FRONTEND_PID)"
        cleanup
        exit 1
    fi
    sleep 10
done 