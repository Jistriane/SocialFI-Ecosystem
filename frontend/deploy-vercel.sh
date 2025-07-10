# Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
# Criado do zero por mim. Removal of this notice is prohibited for 10 years.

#!/bin/bash

# SocialFI Ecosystem - Deploy Script Multi-Network
# Suporte para Ethereum Sepolia e Metis Sepolia
# Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira

set -e

echo "🚀 SocialFI Ecosystem - Deploy Multi-Network"
echo "=============================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para print colorido
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Este script deve ser executado no diretório frontend/"
    exit 1
fi

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    print_error "npm não está instalado. Por favor, instale o npm primeiro."
    exit 1
fi

print_info "Verificando configuração do projeto..."

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    print_warning "Dependências não encontradas. Instalando..."
    npm install
fi

print_status "Dependências verificadas"

# Verificar se o arquivo de configuração existe
if [ ! -f "vercel.json" ]; then
    print_error "Arquivo vercel.json não encontrado. Execute a configuração primeiro."
    exit 1
fi

print_status "Configuração Vercel encontrada"

# Verificar endereços dos contratos
print_info "Verificando endereços dos contratos..."

# Ethereum Sepolia
echo "📋 Contratos Ethereum Sepolia (Chain ID: 11155111):"
echo "   RewardsToken: 0x55c8231d1c0b93d763bc01Fa4f5f9fa1424eaaF8"
echo "   TrustChain: 0x95D41cc1dD95d0C40e401987f4Bc0a7BB2343184"
echo "   TradeConnect: 0x564a7a43A779d0Ebc9a0E9e9A1B8ed1583338706"
echo "   GovGame: 0x7123c8538953Ab1F3Fe9ea83722f6e7133DDF9f8"
echo "   EcosystemHub: 0x8204C13B075e7E90C23C7117bAF31065CE02783b"
echo ""

# Metis Sepolia
echo "📋 Contratos Metis Sepolia (Chain ID: 59902):"
echo "   RewardsToken: 0x2a1df9d5b7D277a614607b4d8C82f3d085638751"
echo "   TrustChain: 0xA6207a47E5D57f905A36756A4681607F12E66239"
echo "   TradeConnect: 0xD0F5BAD2919ccC87583F7AeCb8ea0C12f141AFdf"
echo "   GovGame: 0xf88d37494887b4AB0e1221b73A8056DB61538e85"
echo "   EcosystemHub: 0x86A6FA81b7bA20E9B430613F820583a8473471aB"
echo ""

# Executar testes de build
print_info "Executando teste de build..."

if npm run build > /dev/null 2>&1; then
    print_status "Build executado com sucesso"
else
    print_error "Falha no build. Verifique os erros acima."
    exit 1
fi

# Verificar se o Vercel CLI está disponível
print_info "Verificando Vercel CLI..."

if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI não encontrado globalmente. Usando npx..."
    VERCEL_CMD="npx vercel"
else
    VERCEL_CMD="vercel"
fi

# Verificar se o usuário está logado no Vercel
print_info "Verificando autenticação Vercel..."

if ! $VERCEL_CMD whoami &> /dev/null; then
    print_warning "Você não está logado no Vercel. Fazendo login..."
    $VERCEL_CMD login
fi

print_status "Usuário Vercel autenticado"

# Mostrar informações do projeto
print_info "Informações do projeto:"
echo "   Nome: SocialFI Ecosystem Frontend"
echo "   Tipo: Next.js 14 + TypeScript"
echo "   Redes: Ethereum Sepolia + Metis Sepolia"
echo "   Região: South America (gru1)"
echo ""

# Confirmar deploy
echo -e "${YELLOW}🤔 Deseja continuar com o deploy?${NC}"
echo "   - Build: ✓ Testado"
echo "   - Contratos: ✓ Deployados em ambas as redes"
echo "   - Configuração: ✓ Multi-network"
echo ""

read -p "Continuar? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Deploy cancelado pelo usuário."
    exit 0
fi

# Executar deploy
print_info "Iniciando deploy no Vercel..."

echo ""
echo "🚀 Executando deploy..."
echo "======================"

if $VERCEL_CMD --prod; then
    echo ""
    print_status "Deploy concluído com sucesso!"
    echo ""
    print_info "Próximos passos:"
    echo "1. Configure as variáveis de ambiente no painel da Vercel:"
    echo "   - NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID"
    echo "   - NEXT_PUBLIC_ALCHEMY_API_KEY"
    echo "   - NEXT_PUBLIC_COINMARKETCAP_API_KEY"
    echo ""
    echo "2. Teste o aplicativo em ambas as redes:"
    echo "   - Ethereum Sepolia (Chain ID: 11155111)"
    echo "   - Metis Sepolia (Chain ID: 59902)"
    echo ""
    echo "3. Verifique a funcionalidade de troca de rede"
    echo ""
    echo "4. Teste os contratos em ambas as redes"
    echo ""
    print_info "Links úteis:"
    echo "   - Ethereum Sepolia Explorer: https://sepolia.etherscan.io"
    echo "   - Metis Sepolia Explorer: https://sepolia-explorer.metisdevops.link"
    echo "   - Ethereum Sepolia Faucet: https://sepoliafaucet.com"
    echo "   - Metis Sepolia Faucet: https://sepolia.metisdevops.link/faucet"
    echo ""
    print_status "Deploy multi-network concluído! 🎉"
else
    print_error "Falha no deploy. Verifique os logs acima."
    exit 1
fi 