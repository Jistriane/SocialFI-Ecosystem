# Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
# Criado do zero por mim. Removal of this notice is prohibited for 10 years.

#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para exibir mensagens com timestamp
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERRO: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] AVISO: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Função para verificar versão do Node.js
check_node_version() {
    local required_version="18.0.0"
    if ! command -v node > /dev/null; then
        error "Node.js não está instalado"
        return 1
    fi
    
    local current_version=$(node -v | cut -d'v' -f2)
    
    if [ "$(printf '%s\n' "$required_version" "$current_version" | sort -V | head -n1)" != "$required_version" ]; then
        error "Node.js versão $required_version ou superior é necessária. Versão atual: $current_version"
        return 1
    fi
    log "✅ Node.js versão $current_version OK"
    return 0
}

# Função para verificar estrutura do projeto
check_project_structure() {
    log "🔍 Verificando estrutura do projeto..."
    
    local errors=0
    
    # Verificar arquivos principais
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        error "❌ package.json não encontrado na raiz"
        errors=$((errors + 1))
    else
        log "✅ package.json encontrado na raiz"
    fi
    
    if [ ! -f "$PROJECT_ROOT/hardhat.config.js" ]; then
        error "❌ hardhat.config.js não encontrado"
        errors=$((errors + 1))
    else
        log "✅ hardhat.config.js encontrado"
    fi
    
    # Verificar diretórios principais
    for dir in "contracts" "backend" "frontend" "test"; do
        if [ ! -d "$PROJECT_ROOT/$dir" ]; then
            error "❌ Diretório $dir não encontrado"
            errors=$((errors + 1))
        else
            log "✅ Diretório $dir encontrado"
        fi
    done
    
    # Verificar arquivos do backend
    if [ ! -f "$PROJECT_ROOT/backend/package.json" ]; then
        error "❌ Backend package.json não encontrado"
        errors=$((errors + 1))
    else
        log "✅ Backend package.json encontrado"
    fi
    
    if [ ! -f "$PROJECT_ROOT/backend/src/server.ts" ]; then
        error "❌ Backend server.ts não encontrado"
        errors=$((errors + 1))
    else
        log "✅ Backend server.ts encontrado"
    fi
    
    # Verificar arquivos do frontend
    if [ ! -f "$PROJECT_ROOT/frontend/package.json" ]; then
        error "❌ Frontend package.json não encontrado"
        errors=$((errors + 1))
    else
        log "✅ Frontend package.json encontrado"
    fi
    
    if [ ! -f "$PROJECT_ROOT/frontend/next.config.js" ]; then
        error "❌ Frontend next.config.js não encontrado"
        errors=$((errors + 1))
    else
        log "✅ Frontend next.config.js encontrado"
    fi
    
    return $errors
}

# Função para verificar dependências
check_dependencies() {
    log "📦 Verificando dependências..."
    
    local errors=0
    
    # Verificar dependências da raiz
    cd "$PROJECT_ROOT" || return 1
    if [ ! -d "node_modules" ]; then
        warning "⚠️  Dependências da raiz não instaladas"
        errors=$((errors + 1))
    else
        log "✅ Dependências da raiz instaladas"
    fi
    
    # Verificar dependências do backend
    cd "$PROJECT_ROOT/backend" || return 1
    if [ ! -d "node_modules" ]; then
        warning "⚠️  Dependências do backend não instaladas"
        errors=$((errors + 1))
    else
        log "✅ Dependências do backend instaladas"
    fi
    
    # Verificar dependências do frontend
    cd "$PROJECT_ROOT/frontend" || return 1
    if [ ! -d "node_modules" ]; then
        warning "⚠️  Dependências do frontend não instaladas"
        errors=$((errors + 1))
    else
        log "✅ Dependências do frontend instaladas"
    fi
    
    return $errors
}

# Função para verificar compilação
check_compilation() {
    log "🔧 Verificando compilação..."
    
    local errors=0
    
    # Verificar compilação dos contratos
    cd "$PROJECT_ROOT" || return 1
    if [ ! -d "artifacts/contracts" ]; then
        warning "⚠️  Contratos não compilados"
        info "Tentando compilar contratos..."
        if npm run compile > compile.log 2>&1; then
            log "✅ Contratos compilados com sucesso"
        else
            error "❌ Falha ao compilar contratos (verifique compile.log)"
            errors=$((errors + 1))
        fi
    else
        log "✅ Contratos já compilados"
    fi
    
    # Verificar compilação do backend
    cd "$PROJECT_ROOT/backend" || return 1
    if [ ! -d "dist" ]; then
        warning "⚠️  Backend não compilado"
        info "Tentando compilar backend..."
        if npm run build > ../backend-build.log 2>&1; then
            log "✅ Backend compilado com sucesso"
        else
            error "❌ Falha ao compilar backend (verifique backend-build.log)"
            errors=$((errors + 1))
        fi
    else
        log "✅ Backend já compilado"
    fi
    
    return $errors
}

# Função para executar testes
run_tests() {
    log "🧪 Executando testes..."
    
    local test_results=()
    
    # Testes dos contratos
    info "Testando contratos..."
    cd "$PROJECT_ROOT" || return 1
    if timeout 300 npm test > test-contracts-check.log 2>&1; then
        log "✅ Testes dos contratos: PASSOU"
        test_results+=("CONTRATOS:PASSOU")
    else
        error "❌ Testes dos contratos: FALHOU"
        test_results+=("CONTRATOS:FALHOU")
    fi
    
    # Testes do backend
    info "Testando backend..."
    cd "$PROJECT_ROOT/backend" || return 1
    if timeout 300 npm test > ../test-backend-check.log 2>&1; then
        log "✅ Testes do backend: PASSOU"
        test_results+=("BACKEND:PASSOU")
    else
        error "❌ Testes do backend: FALHOU"
        test_results+=("BACKEND:FALHOU")
    fi
    
    # Testes do frontend
    info "Testando frontend..."
    cd "$PROJECT_ROOT/frontend" || return 1
    if timeout 300 npm test -- --passWithNoTests --silent > ../test-frontend-check.log 2>&1; then
        log "✅ Testes do frontend: PASSOU"
        test_results+=("FRONTEND:PASSOU")
    else
        error "❌ Testes do frontend: FALHOU"
        test_results+=("FRONTEND:FALHOU")
    fi
    
    # Salvar resultados
    printf '%s\n' "${test_results[@]}" > "$PROJECT_ROOT/test-results.txt"
    
    return 0
}

# Função para verificar arquivos de configuração
check_config_files() {
    log "⚙️  Verificando arquivos de configuração..."
    
    local errors=0
    
    # Verificar arquivos .env
    for dir in "backend" "frontend"; do
        if [ ! -f "$PROJECT_ROOT/$dir/.env" ] && [ ! -f "$PROJECT_ROOT/$dir/.env-dev" ]; then
            error "❌ Arquivo .env ou .env-dev não encontrado em $dir"
            errors=$((errors + 1))
        else
            log "✅ Arquivo de ambiente encontrado em $dir"
        fi
    done
    
    # Verificar configurações específicas
    if [ -f "$PROJECT_ROOT/backend/src/config/index.ts" ]; then
        log "✅ Configuração do backend encontrada"
    else
        error "❌ Configuração do backend não encontrada"
        errors=$((errors + 1))
    fi
    
    if [ -f "$PROJECT_ROOT/frontend/next.config.js" ]; then
        log "✅ Configuração do frontend encontrada"
    else
        error "❌ Configuração do frontend não encontrada"
        errors=$((errors + 1))
    fi
    
    return $errors
}

# Função para gerar relatório final
generate_report() {
    log "📋 Gerando relatório final..."
    
    local report_file="$PROJECT_ROOT/system-check-report.txt"
    
    cat > "$report_file" << EOF
========================================
    RELATÓRIO DE VERIFICAÇÃO DO SISTEMA
    SocialFI Ecosystem
    Data: $(date '+%Y-%m-%d %H:%M:%S')
========================================

ESTRUTURA DO PROJETO: $PROJECT_STRUCTURE_STATUS
DEPENDÊNCIAS: $DEPENDENCIES_STATUS
COMPILAÇÃO: $COMPILATION_STATUS
CONFIGURAÇÃO: $CONFIG_STATUS

RESULTADOS DOS TESTES:
EOF
    
    if [ -f "$PROJECT_ROOT/test-results.txt" ]; then
        cat "$PROJECT_ROOT/test-results.txt" >> "$report_file"
    else
        echo "Testes não executados" >> "$report_file"
    fi
    
    cat >> "$report_file" << EOF

LOGS DISPONÍVEIS:
- Compilação: compile.log
- Backend Build: backend-build.log
- Testes Contratos: test-contracts-check.log
- Testes Backend: test-backend-check.log
- Testes Frontend: test-frontend-check.log

RECOMENDAÇÕES:
EOF
    
    if [ "$PROJECT_STRUCTURE_STATUS" != "OK" ]; then
        echo "- Verifique a estrutura do projeto" >> "$report_file"
    fi
    
    if [ "$DEPENDENCIES_STATUS" != "OK" ]; then
        echo "- Execute: npm install em cada diretório" >> "$report_file"
    fi
    
    if [ "$COMPILATION_STATUS" != "OK" ]; then
        echo "- Verifique os erros de compilação nos logs" >> "$report_file"
    fi
    
    if [ "$CONFIG_STATUS" != "OK" ]; then
        echo "- Configure os arquivos .env necessários" >> "$report_file"
    fi
    
    echo "========================================" >> "$report_file"
    
    log "✅ Relatório salvo em: $report_file"
}

# Função para exibir resumo
show_summary() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}    RESUMO DA VERIFICAÇÃO DO SISTEMA    ${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}Estrutura do Projeto: $PROJECT_STRUCTURE_STATUS${NC}"
    echo -e "${GREEN}Dependências: $DEPENDENCIES_STATUS${NC}"
    echo -e "${GREEN}Compilação: $COMPILATION_STATUS${NC}"
    echo -e "${GREEN}Configuração: $CONFIG_STATUS${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    if [ -f "$PROJECT_ROOT/test-results.txt" ]; then
        echo -e "${YELLOW}Resultados dos Testes:${NC}"
        while IFS=: read -r component status; do
            if [ "$status" = "PASSOU" ]; then
                echo -e "${GREEN}  $component: ✅ $status${NC}"
            else
                echo -e "${RED}  $component: ❌ $status${NC}"
            fi
        done < "$PROJECT_ROOT/test-results.txt"
        echo -e "${BLUE}========================================${NC}"
    fi
    
    echo -e "${YELLOW}Relatório completo: system-check-report.txt${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# INÍCIO DO SCRIPT PRINCIPAL
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    SocialFI Ecosystem - System Test    ${NC}"
echo -e "${BLUE}    Verificação Completa do Sistema     ${NC}"
echo -e "${BLUE}========================================${NC}"

# Diretório raiz do projeto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
log "📁 Diretório do projeto: $PROJECT_ROOT"

# Verificar se estamos no diretório correto
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    error "❌ Execute o script a partir da raiz do projeto SocialFI Ecosystem"
    exit 1
fi

# 1. Verificar Node.js
if check_node_version; then
    NODE_STATUS="OK"
else
    NODE_STATUS="ERRO"
    error "❌ Verifique a instalação do Node.js"
    exit 1
fi

# 2. Verificar estrutura do projeto
if check_project_structure; then
    PROJECT_STRUCTURE_STATUS="OK"
else
    PROJECT_STRUCTURE_STATUS="ERRO"
fi

# 3. Verificar dependências
if check_dependencies; then
    DEPENDENCIES_STATUS="OK"
else
    DEPENDENCIES_STATUS="AVISO"
fi

# 4. Verificar compilação
if check_compilation; then
    COMPILATION_STATUS="OK"
else
    COMPILATION_STATUS="ERRO"
fi

# 5. Verificar configuração
if check_config_files; then
    CONFIG_STATUS="OK"
else
    CONFIG_STATUS="ERRO"
fi

# 6. Executar testes
run_tests

# 7. Gerar relatório
generate_report

# 8. Exibir resumo
show_summary

# Determinar código de saída
if [ "$PROJECT_STRUCTURE_STATUS" = "OK" ] && [ "$COMPILATION_STATUS" = "OK" ] && [ "$CONFIG_STATUS" = "OK" ]; then
    log "🎉 Sistema verificado com sucesso!"
    exit 0
else
    error "⚠️  Sistema possui problemas que precisam ser corrigidos"
    exit 1
fi 