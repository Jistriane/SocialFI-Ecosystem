# Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
# Criado do zero por mim. Removal of this notice is prohibited for 10 years.

#!/bin/bash

# Script para verificar o status do sistema SocialFI Ecosystem
# Autor: Sistema SocialFI
# Data: 2025-06-26

echo "🔍 Verificando Status do Sistema SocialFI Ecosystem"
echo "=================================================="

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para verificar se um serviço está rodando
check_service() {
    local service_name=$1
    local port=$2
    local url=$3
    
    echo -e "\n${BLUE}📡 Verificando ${service_name}...${NC}"
    
    # Verificar se a porta está aberta
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "   ✅ Porta $port está aberta"
        
        # Verificar se o serviço responde
        if curl -s "$url" >/dev/null 2>&1; then
            echo -e "   ✅ ${service_name} está respondendo"
            echo -e "   🌐 URL: $url"
            return 0
        else
            echo -e "   ❌ ${service_name} não está respondendo"
            return 1
        fi
    else
        echo -e "   ❌ Porta $port não está aberta"
        return 1
    fi
}

# Verificar Node.js
echo -e "\n${BLUE}🔧 Verificando dependências...${NC}"
if command -v node &> /dev/null; then
    echo -e "   ✅ Node.js $(node --version)"
else
    echo -e "   ❌ Node.js não encontrado"
fi

if command -v npm &> /dev/null; then
    echo -e "   ✅ npm $(npm --version)"
else
    echo -e "   ❌ npm não encontrado"
fi

# Verificar serviços
echo -e "\n${YELLOW}🚀 Verificando serviços...${NC}"

# Backend
if check_service "Backend API" 3002 "http://localhost:3002/api/health"; then
    backend_status="✅"
else
    backend_status="❌"
fi

# Frontend
if check_service "Frontend" 3001 "http://localhost:3001"; then
    frontend_status="✅"
else
    frontend_status="❌"
fi

# Verificar se os contratos estão deployados
echo -e "\n${BLUE}📋 Verificando contratos...${NC}"
if [ -f "artifacts/contracts/TrustChain.sol/TrustChain.json" ]; then
    echo -e "   ✅ Contratos compilados encontrados"
    contracts_status="✅"
else
    echo -e "   ❌ Contratos não compilados"
    contracts_status="❌"
fi

# Verificar arquivos de configuração
echo -e "\n${BLUE}⚙️  Verificando configurações...${NC}"
config_issues=0

if [ -f "frontend/.env.local" ]; then
    echo -e "   ✅ Frontend .env.local encontrado"
else
    echo -e "   ⚠️  Frontend .env.local não encontrado (usando padrões)"
    config_issues=$((config_issues + 1))
fi

if [ -f "backend/.env" ]; then
    echo -e "   ✅ Backend .env encontrado"
else
    echo -e "   ⚠️  Backend .env não encontrado"
    config_issues=$((config_issues + 1))
fi

# Resumo final
echo -e "\n${YELLOW}📊 RESUMO DO SISTEMA${NC}"
echo "========================"
echo -e "Backend API:      $backend_status"
echo -e "Frontend:         $frontend_status"
echo -e "Contratos:        $contracts_status"
echo -e "Configurações:    $([ $config_issues -eq 0 ] && echo '✅' || echo '⚠️ ')"

# Status geral
if [[ "$backend_status" == "✅" && "$frontend_status" == "✅" && "$contracts_status" == "✅" ]]; then
    echo -e "\n${GREEN}🎉 Sistema funcionando corretamente!${NC}"
    echo -e "${GREEN}🌐 Acesse: http://localhost:3001${NC}"
    echo -e "\n${BLUE}📱 Funcionalidades disponíveis:${NC}"
    echo -e "   • TrustChain - Sistema de confiança descentralizado"
    echo -e "   • TradeConnect - Marketplace P2P"
    echo -e "   • GovGame - Governança gamificada"
    echo -e "   • Tema Metis Hyperion aplicado ✨"
    exit 0
else
    echo -e "\n${RED}⚠️  Alguns componentes precisam de atenção${NC}"
    
    # Sugestões de correção
    echo -e "\n${YELLOW}💡 Sugestões:${NC}"
    
    if [[ "$backend_status" == "❌" ]]; then
        echo -e "   • Inicie o backend: cd backend && npm run dev"
    fi
    
    if [[ "$frontend_status" == "❌" ]]; then
        echo -e "   • Inicie o frontend: cd frontend && npm run dev"
    fi
    
    if [[ "$contracts_status" == "❌" ]]; then
        echo -e "   • Compile os contratos: npx hardhat compile"
    fi
    
    if [[ $config_issues -gt 0 ]]; then
        echo -e "   • Configure os arquivos .env necessários"
    fi
    
    exit 1
fi 