# Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
# Criado do zero por mim. Removal of this notice is prohibited for 10 years.

#!/bin/bash

# Script de inicialização do sistema SocialFI Ecosystem v3.0
# Suporte para Multi-Testnet (Metis Sepolia + Ethereum Sepolia)
# Sistema de monitoramento avançado e recuperação automática
# Autor: Sistema SocialFI
# Data: $(date +%Y-%m-%d)
# Versão: 3.0.0 - Sistema Completamente Atualizado

set -euo pipefail  # Parar execução em caso de erro, variáveis não definidas e pipes

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
BLOCKCHAIN_PID=""

# Configurações do sistema
BACKEND_PORT=3002
FRONTEND_PORT=3001
SOCKET_PORT=3003
HARDHAT_PORT=8545

# Timeouts (em segundos)
INSTALL_TIMEOUT=900     # 15 minutos para instalação
BACKEND_TIMEOUT=180     # 3 minutos para backend
FRONTEND_TIMEOUT=420    # 7 minutos para frontend
TEST_TIMEOUT=600        # 10 minutos para testes
COMPILE_TIMEOUT=300     # 5 minutos para compilação

# Status dos testes
CONTRACTS_TEST_STATUS="N/A"
BACKEND_TEST_STATUS="N/A"
FRONTEND_TEST_STATUS="N/A"

# Controle de execução
SKIP_TESTS=false
SKIP_DEPENDENCIES=false
FORCE_REINSTALL=false
PRODUCTION_MODE=false
VERBOSE_MODE=false

# Arquivos de log
MAIN_LOG="$PROJECT_ROOT/system-startup.log"
BACKEND_LOG="$PROJECT_ROOT/backend.log"
FRONTEND_LOG="$PROJECT_ROOT/frontend.log"
CONTRACTS_LOG="$PROJECT_ROOT/contracts.log"

# Função para log colorido com arquivo
log() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1"
    echo -e "${GREEN}${message}${NC}"
    echo "$message" >> "$MAIN_LOG"
}

error() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1"
    echo -e "${RED}${message}${NC}"
    echo "$message" >> "$MAIN_LOG"
}

warning() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1"
    echo -e "${YELLOW}${message}${NC}"
    echo "$message" >> "$MAIN_LOG"
}

info() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️  $1"
    echo -e "${BLUE}${message}${NC}"
    echo "$message" >> "$MAIN_LOG"
}

debug() {
    if [ "$VERBOSE_MODE" = true ]; then
        local message="[$(date +'%Y-%m-%d %H:%M:%S')] 🔍 $1"
        echo -e "${PURPLE}${message}${NC}"
        echo "$message" >> "$MAIN_LOG"
    fi
}

# Função para mostrar progresso
show_progress() {
    local current=$1
    local total=$2
    local operation=$3
    local percent=$((current * 100 / total))
    local bar_length=20
    local filled_length=$((percent * bar_length / 100))
    
    local bar=""
    for ((i=0; i<filled_length; i++)); do bar+="█"; done
    for ((i=filled_length; i<bar_length; i++)); do bar+="░"; done
    
    printf "\r${CYAN}[%s] %d%% %s${NC}" "$bar" "$percent" "$operation"
    if [ "$current" -eq "$total" ]; then
        echo ""
    fi
}

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para verificar se uma porta está em uso
is_port_in_use() {
    local port=$1
    if command_exists lsof; then
        lsof -i ":$port" >/dev/null 2>&1
    elif command_exists netstat; then
        netstat -tuln | grep ":$port " >/dev/null 2>&1
    elif command_exists ss; then
        ss -tuln | grep ":$port " >/dev/null 2>&1
    else
        # Fallback usando nc
        nc -z localhost "$port" 2>/dev/null
    fi
}

# Função para matar processo em uma porta
kill_process_on_port() {
    local port=$1
    if command_exists lsof; then
        local pid=$(lsof -ti ":$port" 2>/dev/null)
        if [ -n "$pid" ]; then
            debug "Matando processo $pid na porta $port"
            kill -9 "$pid" 2>/dev/null || true
            sleep 2
        fi
    fi
}

# Função para verificar se um processo está rodando
is_process_running() {
    local pid=$1
    [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}

# Função para aguardar um processo terminar
wait_for_process_to_stop() {
    local pid=$1
    local timeout=${2:-30}
    local counter=0
    
    while is_process_running "$pid" && [ $counter -lt $timeout ]; do
        sleep 1
        counter=$((counter + 1))
    done
    
    if is_process_running "$pid"; then
        debug "Forçando término do processo $pid"
        kill -9 "$pid" 2>/dev/null || true
    fi
}

# Função para verificar pré-requisitos
check_prerequisites() {
    log "🔍 Verificando pré-requisitos do sistema..."
    
    local prerequisites_ok=true
    
    # Verificar Node.js
    if ! command_exists node; then
        error "Node.js não está instalado. Instale Node.js 18+ primeiro."
        prerequisites_ok=false
    else
        local node_version=$(node --version | sed 's/v//')
        local major_version=$(echo $node_version | cut -d. -f1)
        
        if [ "$major_version" -lt 18 ]; then
            error "Node.js versão 18+ é necessário. Versão atual: $node_version"
            prerequisites_ok=false
        else
            log "Node.js versão $node_version detectado ✅"
        fi
    fi
    
    # Verificar npm
    if ! command_exists npm; then
        error "npm não está instalado."
        prerequisites_ok=false
    else
        local npm_version=$(npm --version)
        log "npm versão $npm_version detectado ✅"
    fi
    
    # Verificar Git
    if ! command_exists git; then
        warning "Git não encontrado. Algumas funcionalidades podem não funcionar."
    else
        debug "Git detectado: $(git --version)"
    fi
    
    # Verificar curl
    if ! command_exists curl; then
        warning "curl não encontrado. Instalando..."
        if command_exists apt-get; then
            sudo apt-get update && sudo apt-get install -y curl
        elif command_exists yum; then
            sudo yum install -y curl
        else
            warning "Não foi possível instalar curl automaticamente"
        fi
    fi
    
    # Verificar ferramentas de rede
    local network_tool_found=false
    for tool in lsof netstat ss nc; do
        if command_exists "$tool"; then
            debug "Ferramenta de rede encontrada: $tool"
            network_tool_found=true
            break
        fi
    done
    
    if [ "$network_tool_found" = false ]; then
        warning "Nenhuma ferramenta de rede encontrada. Instalando netcat..."
        if command_exists apt-get; then
            sudo apt-get update && sudo apt-get install -y netcat-openbsd
        elif command_exists yum; then
            sudo yum install -y nc
        else
            warning "Não foi possível instalar ferramentas de rede automaticamente"
        fi
    fi
    
    # Verificar espaço em disco
    local available_space=$(df "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
    if [ "$available_space" -lt 1048576 ]; then  # 1GB em KB
        warning "Pouco espaço em disco disponível: $(($available_space / 1024))MB"
        warning "Recomendado: pelo menos 1GB livre"
    fi
    
    # Verificar memória RAM
    if command_exists free; then
        local available_memory=$(free -m | awk 'NR==2{print $7}')
        if [ "$available_memory" -lt 512 ]; then
            warning "Pouca memória RAM disponível: ${available_memory}MB"
            warning "Recomendado: pelo menos 512MB livre"
        fi
    fi
    
    if [ "$prerequisites_ok" = false ]; then
        error "Pré-requisitos não atendidos. Corrija os problemas acima antes de continuar."
        exit 1
    fi
    
    log "Todos os pré-requisitos verificados com sucesso ✅"
}

# Função para processar argumentos da linha de comando
process_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                SKIP_TESTS=true
                info "Testes serão pulados"
                shift
                ;;
            --skip-deps|--skip-dependencies)
                SKIP_DEPENDENCIES=true
                info "Instalação de dependências será pulada"
                shift
                ;;
            --force-reinstall)
                FORCE_REINSTALL=true
                info "Reinstalação forçada de dependências"
                shift
                ;;
            --production)
                PRODUCTION_MODE=true
                info "Modo de produção ativado"
                shift
                ;;
            --verbose|-v)
                VERBOSE_MODE=true
                info "Modo verboso ativado"
                shift
                ;;
            --backend-port)
                BACKEND_PORT="$2"
                info "Porta do backend definida para: $BACKEND_PORT"
                shift 2
                ;;
            --frontend-port)
                FRONTEND_PORT="$2"
                info "Porta do frontend definida para: $FRONTEND_PORT"
                shift 2
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                warning "Argumento desconhecido: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Função para mostrar ajuda
show_help() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  SocialFI Ecosystem - Sistema de Inicialização${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}Uso: $0 [opções]${NC}"
    echo ""
    echo -e "${YELLOW}Opções:${NC}"
    echo -e "  --skip-tests              Pular execução dos testes"
    echo -e "  --skip-deps               Pular instalação de dependências"
    echo -e "  --force-reinstall         Forçar reinstalação de dependências"
    echo -e "  --production              Executar em modo de produção"
    echo -e "  --verbose, -v             Ativar modo verboso"
    echo -e "  --backend-port PORT       Definir porta do backend (padrão: 3002)"
    echo -e "  --frontend-port PORT      Definir porta do frontend (padrão: 3001)"
    echo -e "  --help, -h                Mostrar esta ajuda"
    echo ""
    echo -e "${CYAN}Exemplos:${NC}"
    echo -e "  $0                        Inicialização completa"
    echo -e "  $0 --skip-tests           Inicializar sem executar testes"
    echo -e "  $0 --verbose              Inicializar com saída detalhada"
    echo -e "  $0 --production           Inicializar em modo de produção"
    echo ""
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

# Função para instalar dependências com tratamento de erros melhorado
install_dependencies() {
    local dir=$1
    local name=$2
    
    if [ "$SKIP_DEPENDENCIES" = true ]; then
        info "⏭️  Pulando instalação de dependências para $name"
        return 0
    fi
    
    log "📦 Instalando dependências em $name ($dir)..."
    
    # Verificar se o diretório existe
    if [ ! -d "$dir" ]; then
        error "Diretório não encontrado: $dir"
        return 1
    fi
    
    cd "$dir" || exit 1
    
    # Verificar se package.json existe
    if [ ! -f "package.json" ]; then
        error "package.json não encontrado em $dir"
        return 1
    fi
    
    # Verificar se já existem dependências instaladas
    if [ -d "node_modules" ] && [ "$FORCE_REINSTALL" = false ]; then
        local package_lock_hash=""
        local current_hash=""
        
        if [ -f "package-lock.json" ]; then
            package_lock_hash=$(md5sum package-lock.json 2>/dev/null | cut -d' ' -f1)
        fi
        
        if [ -f ".install_hash" ]; then
            current_hash=$(cat .install_hash 2>/dev/null)
        fi
        
        if [ "$package_lock_hash" = "$current_hash" ] && [ -n "$package_lock_hash" ]; then
            info "⏭️  Dependências já instaladas e atualizadas em $name"
            return 0
        fi
    fi
    
    # Limpar instalação anterior se necessário
    if [ "$FORCE_REINSTALL" = true ] || [ -d "node_modules" ]; then
        info "🧹 Limpando instalação anterior em $name..."
        rm -rf node_modules package-lock.json .install_hash 2>/dev/null || true
    fi
    
    # Limpar cache npm
    debug "Limpando cache npm..."
    npm cache clean --force > /dev/null 2>&1 || true
    
    # Preparar comando de instalação
    local install_cmd="npm install"
    if [ "$PRODUCTION_MODE" = true ]; then
        install_cmd="npm ci --only=production"
    else
        install_cmd="npm install --legacy-peer-deps"
    fi
    
    info "📥 Executando $install_cmd em $name..."
    
    # Executar instalação com timeout
    timeout "$INSTALL_TIMEOUT" $install_cmd > "../install-$name.log" 2>&1 &
    local npm_pid=$!
    
    # Monitorar progresso
    local counter=0
    local progress_interval=30
    
    while is_process_running "$npm_pid"; do
        sleep 5
        counter=$((counter + 5))
        
        if [ $((counter % progress_interval)) -eq 0 ]; then
            show_progress "$counter" "$INSTALL_TIMEOUT" "Instalando $name"
        fi
        
        if [ $counter -ge $INSTALL_TIMEOUT ]; then
            error "❌ Timeout na instalação de dependências para $name após $((INSTALL_TIMEOUT/60)) minutos"
            kill -9 "$npm_pid" 2>/dev/null || true
            return 1
        fi
    done
    
    # Verificar se a instalação foi bem-sucedida
    wait "$npm_pid"
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log "✅ Dependências instaladas com sucesso em $name em ${counter}s"
        
        # Salvar hash para verificação futura
        if [ -f "package-lock.json" ]; then
            md5sum package-lock.json | cut -d' ' -f1 > .install_hash
        fi
    else
        error "❌ Falha ao instalar dependências em $name (código: $exit_code)"
        error "Verifique o log: install-$name.log"
        return 1
    fi
    
    # Compilar TypeScript se necessário
    if [[ $name == "backend" ]] && [ -f "tsconfig.json" ]; then
        log "🔨 Compilando TypeScript do backend..."
        if timeout "$COMPILE_TIMEOUT" npm run build > "../compile-backend.log" 2>&1; then
            log "✅ Backend compilado com sucesso"
        else
            error "❌ Falha ao compilar o backend"
            error "Verifique o log: compile-backend.log"
            return 1
        fi
    fi
    
    return 0
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
    local service_name=$2
    
    if is_port_in_use "$port"; then
        warning "⚠️  Porta $port ($service_name) está em uso."
        
        # Mostrar qual processo está usando a porta
        if command_exists lsof; then
            local process_info=$(lsof -i ":$port" 2>/dev/null | tail -n +2)
            if [ -n "$process_info" ]; then
                warning "Processo usando a porta: $process_info"
            fi
        fi
        
        # Perguntar se deve matar o processo
        read -p "Deseja terminar o processo na porta $port? (s/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            kill_process_on_port "$port"
            sleep 2
            
            if is_port_in_use "$port"; then
                error "❌ Não foi possível liberar a porta $port"
                return 1
            else
                log "✅ Porta $port liberada com sucesso"
            fi
        else
            warning "⚠️  Continuando com porta $port em uso. Pode haver conflitos."
        fi
    else
        debug "Porta $port ($service_name) disponível"
    fi
    
    return 0
}

# Função para verificar portas disponíveis
check_system_ports() {
    log "🔍 Verificando disponibilidade das portas do sistema..."
    
    local ports_to_check=(
        "$FRONTEND_PORT:Frontend"
        "$BACKEND_PORT:Backend API"
        "$SOCKET_PORT:Socket.IO"
        "$HARDHAT_PORT:Hardhat Node"
    )
    
    local all_ports_ok=true
    
    for port_info in "${ports_to_check[@]}"; do
        local port="${port_info%:*}"
        local service="${port_info#*:}"
        
        if ! check_port "$port" "$service"; then
            all_ports_ok=false
        fi
    done
    
    if [ "$all_ports_ok" = true ]; then
        log "✅ Todas as portas verificadas e disponíveis"
    else
        warning "⚠️  Algumas portas podem estar em conflito"
    fi
}

# Função para cleanup ao sair
cleanup() {
    echo ""
    log "🧹 Encerrando serviços do sistema..."
    
    # Parar serviços em ordem reversa
    local services_stopped=0
    
    # Parar frontend
    if [ -n "$FRONTEND_PID" ] && is_process_running "$FRONTEND_PID"; then
        info "Parando frontend (PID: $FRONTEND_PID)..."
        kill -TERM "$FRONTEND_PID" 2>/dev/null || true
        wait_for_process_to_stop "$FRONTEND_PID" 10
        services_stopped=$((services_stopped + 1))
    fi
    
    # Parar backend
    if [ -n "$BACKEND_PID" ] && is_process_running "$BACKEND_PID"; then
        info "Parando backend (PID: $BACKEND_PID)..."
        kill -TERM "$BACKEND_PID" 2>/dev/null || true
        wait_for_process_to_stop "$BACKEND_PID" 10
        services_stopped=$((services_stopped + 1))
    fi
    
    # Parar hardhat node se existir
    if [ -n "$HARDHAT_PID" ] && is_process_running "$HARDHAT_PID"; then
        info "Parando Hardhat node (PID: $HARDHAT_PID)..."
        kill -TERM "$HARDHAT_PID" 2>/dev/null || true
        wait_for_process_to_stop "$HARDHAT_PID" 10
        services_stopped=$((services_stopped + 1))
    fi
    
    # Limpar processos órfãos nas portas
    for port in "$FRONTEND_PORT" "$BACKEND_PORT" "$SOCKET_PORT" "$HARDHAT_PORT"; do
        if is_port_in_use "$port"; then
            debug "Limpando porta $port..."
            kill_process_on_port "$port"
        fi
    done
    
    # Salvar relatório final
    if [ $services_stopped -gt 0 ]; then
        log "✅ $services_stopped serviço(s) encerrado(s) com sucesso"
    fi
    
    log "🔚 Sistema SocialFI Ecosystem encerrado"
    echo "Logs salvos em: $MAIN_LOG" >> "$MAIN_LOG"
    echo "Encerramento: $(date)" >> "$MAIN_LOG"
    
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
    local end_time=$(date +%s)
    local start_time_file="$PROJECT_ROOT/.start_time"
    local total_time="N/A"
    
    if [ -f "$start_time_file" ]; then
        local start_time=$(cat "$start_time_file")
        total_time=$((end_time - start_time))
        rm -f "$start_time_file"
    fi
    
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}    🎉 SISTEMA INICIADO COM SUCESSO!    ${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}🌐 SERVIÇOS DISPONÍVEIS:${NC}"
    echo -e "${GREEN}  Frontend:     http://localhost:${FRONTEND_PORT}${NC}"
    echo -e "${GREEN}  Backend API:  http://localhost:${BACKEND_PORT}${NC}"
    echo -e "${GREEN}  Socket.IO:    http://localhost:${BACKEND_PORT}/socket.io${NC}"
    echo -e "${GREEN}  WebSocket:    ws://localhost:${BACKEND_PORT}${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${BLUE}📊 RELATÓRIO DE TESTES:${NC}"
    echo -e "${BLUE}  - Contratos:  ${CONTRACTS_TEST_STATUS}${NC}"
    echo -e "${BLUE}  - Backend:    ${BACKEND_TEST_STATUS}${NC}"
    echo -e "${BLUE}  - Frontend:   ${FRONTEND_TEST_STATUS}${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${CYAN}⚙️  CONFIGURAÇÕES:${NC}"
    echo -e "${CYAN}  - Modo:       $([ "$PRODUCTION_MODE" = true ] && echo "Produção" || echo "Desenvolvimento")${NC}"
    echo -e "${CYAN}  - Rede:       Multi-Testnet (Metis + Ethereum Sepolia)${NC}"
    echo -e "${CYAN}  - Node.js:    $(node --version)${NC}"
    if [ "$total_time" != "N/A" ]; then
        echo -e "${CYAN}  - Tempo:      ${total_time}s ($(($total_time/60))min)${NC}"
    fi
    echo -e "${GREEN}========================================${NC}"
    echo -e "${YELLOW}📋 LOGS E MONITORAMENTO:${NC}"
    echo -e "${YELLOW}  - Principal:  $MAIN_LOG${NC}"
    echo -e "${YELLOW}  - Backend:    $BACKEND_LOG${NC}"
    echo -e "${YELLOW}  - Frontend:   $FRONTEND_LOG${NC}"
    echo -e "${YELLOW}  - Contratos:  $CONTRACTS_LOG${NC}"
    echo -e "${YELLOW}  - Instalação: install-*.log${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${PURPLE}🔗 LINKS ÚTEIS:${NC}"
    echo -e "${PURPLE}  - Metis Explorer: https://hyperion-testnet-explorer.metisdevops.link${NC}"
    echo -e "${PURPLE}  - Ethereum Explorer: https://sepolia.etherscan.io${NC}"
    echo -e "${PURPLE}  - Documentação: README.md${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${BLUE}💡 Pressione CTRL+C para encerrar todos os serviços${NC}"
    echo -e "${BLUE}💡 Use '$0 --help' para ver todas as opções disponíveis${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    # Salvar relatório no log
    {
        echo "========================================" 
        echo "RELATÓRIO FINAL - $(date)"
        echo "========================================" 
        echo "Frontend: http://localhost:${FRONTEND_PORT}"
        echo "Backend: http://localhost:${BACKEND_PORT}"
        echo "Testes - Contratos: ${CONTRACTS_TEST_STATUS}"
        echo "Testes - Backend: ${BACKEND_TEST_STATUS}"
        echo "Testes - Frontend: ${FRONTEND_TEST_STATUS}"
        if [ "$total_time" != "N/A" ]; then
            echo "Tempo total de inicialização: ${total_time}s"
        fi
        echo "========================================"
    } >> "$MAIN_LOG"
}

# INÍCIO DO SCRIPT PRINCIPAL
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    SocialFI Ecosystem - Start System  ${NC}"
echo -e "${BLUE}    Versão 3.0 - Sistema Completamente Atualizado${NC}"
echo -e "${BLUE}========================================${NC}"

# Inicializar log principal
echo "=== Inicialização do Sistema SocialFI Ecosystem ===" > "$MAIN_LOG"
echo "Data: $(date)" >> "$MAIN_LOG"
echo "Usuário: $(whoami)" >> "$MAIN_LOG"
echo "Diretório: $PROJECT_ROOT" >> "$MAIN_LOG"
echo "========================================" >> "$MAIN_LOG"

# Processar argumentos da linha de comando
process_arguments "$@"

# Registrar handler para CTRL+C
trap cleanup SIGINT SIGTERM

# Verificar se estamos no diretório correto
if [ ! -f "$PROJECT_ROOT/package.json" ] || [ ! -d "$PROJECT_ROOT/contracts" ]; then
    error "❌ Diretório do projeto inválido. Execute o script a partir da raiz do projeto SocialFI Ecosystem."
    error "Diretório atual: $(pwd)"
    error "PROJECT_ROOT: $PROJECT_ROOT"
    exit 1
fi

log "🚀 Iniciando sistema SocialFI Ecosystem v3.0"
log "📁 Diretório do projeto: $PROJECT_ROOT"

# Salvar timestamp de início
date +%s > "$PROJECT_ROOT/.start_time"

# 1. Verificar pré-requisitos
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
if [ "$SKIP_TESTS" = false ]; then
    run_tests
else
    info "⏭️  Testes pulados conforme solicitado"
fi

# 9. Iniciar serviços
log "🚀 Iniciando serviços do sistema..."

# Verificar portas uma última vez antes de iniciar
check_system_ports

# Iniciar backend
log "🔧 Iniciando backend na porta $BACKEND_PORT..."
cd "$PROJECT_ROOT/backend" || exit 1

# Definir variável de ambiente para a porta
export PORT="$BACKEND_PORT"

if [ "$PRODUCTION_MODE" = true ]; then
    npm run start > "$BACKEND_LOG" 2>&1 &
else
    npm run dev > "$BACKEND_LOG" 2>&1 &
fi

BACKEND_PID=$!
log "Backend iniciado com PID: $BACKEND_PID"

# Aguardar backend inicializar antes do frontend
info "⏳ Aguardando backend estabilizar..."
sleep 5

# Iniciar frontend
log "🎨 Iniciando frontend na porta $FRONTEND_PORT..."
cd "$PROJECT_ROOT/frontend" || exit 1

if [ "$PRODUCTION_MODE" = true ]; then
    npm run start > "$FRONTEND_LOG" 2>&1 &
else
    npm run dev > "$FRONTEND_LOG" 2>&1 &
fi

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
monitor_system() {
    log "🔄 Monitorando processos do sistema..."
    info "Sistema em execução. Monitorando saúde dos serviços..."

    local monitor_interval=10
    local health_check_interval=60
    local health_check_counter=0

while true; do
    # Verificar se os processos ainda estão rodando
    if [ -n "$BACKEND_PID" ] && ! is_process_running "$BACKEND_PID"; then
        error "❌ Backend parou de responder (PID: $BACKEND_PID)"
        error "Verifique o log: $BACKEND_LOG"
        cleanup
        exit 1
    fi
    
    if [ -n "$FRONTEND_PID" ] && ! is_process_running "$FRONTEND_PID"; then
        error "❌ Frontend parou de responder (PID: $FRONTEND_PID)"
        error "Verifique o log: $FRONTEND_LOG"
        cleanup
        exit 1
    fi
    
    # Health check periódico
    health_check_counter=$((health_check_counter + monitor_interval))
    if [ $health_check_counter -ge $health_check_interval ]; then
        debug "Executando health check dos serviços..."
        
        # Verificar se as portas ainda estão respondendo
        if ! is_port_in_use "$BACKEND_PORT"; then
            warning "⚠️  Porta do backend ($BACKEND_PORT) não está respondendo"
        fi
        
        if ! is_port_in_use "$FRONTEND_PORT"; then
            warning "⚠️  Porta do frontend ($FRONTEND_PORT) não está respondendo"
        fi
        
        health_check_counter=0
    fi
    
    sleep $monitor_interval
done
}

# Chamar função de monitoramento
monitor_system