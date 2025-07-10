# Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
# Criado do zero por mim. Removal of this notice is prohibited for 10 years.

#!/bin/bash

echo "🔧 Configurando variáveis de ambiente no Netlify..."

# Configurações básicas
netlify env:set NODE_ENV production
netlify env:set PORT 8888
netlify env:set CORS_ORIGIN "https://frontend-nbayoxu23-jistrianes-projects.vercel.app"
netlify env:set JWT_SECRET "socialfi-super-secret-jwt-key-2025"
netlify env:set JWT_EXPIRES_IN "24h"
netlify env:set LOG_LEVEL "info"
netlify env:set CHAIN_ID "11155111"

# Contract Addresses - Ethereum Sepolia
netlify env:set TRUST_CHAIN_ADDRESS "0x95D41cc1dD95d0C40e401987f4Bc0a7BB2343184"
netlify env:set TRADE_CONNECT_ADDRESS "0x564a7a43A779d0Ebc9a0E9e9A1B8ed1583338706"
netlify env:set GOV_GAME_ADDRESS "0x7123c8538953Ab1F3Fe9ea83722f6e7133DDF9f8"
netlify env:set REWARDS_TOKEN_ADDRESS "0x55c8231d1c0b93d763bc01Fa4f5f9fa1424eaaF8"
netlify env:set ECOSYSTEM_HUB_ADDRESS "0x8204C13B075e7E90C23C7117bAF31065CE02783b"

# Contract Addresses - Metis Sepolia
netlify env:set METIS_TRUST_CHAIN_ADDRESS "0xA6207a47E5D57f905A36756A4681607F12E66239"
netlify env:set METIS_TRADE_CONNECT_ADDRESS "0xD0F5BAD2919ccC87583F7AeCb8ea0C12f141AFdf"
netlify env:set METIS_GOV_GAME_ADDRESS "0xf88d37494887b4AB0e1221b73A8056DB61538e85"
netlify env:set METIS_REWARDS_TOKEN_ADDRESS "0x2a1df9d5b7D277a614607b4d8C82f3d085638751"
netlify env:set METIS_ECOSYSTEM_HUB_ADDRESS "0x86A6FA81b7bA20E9B430613F820583a8473471aB"

# Socket Configuration
netlify env:set SOCKET_PATH "/socket.io"
netlify env:set SOCKET_PORT "3003"

echo "✅ Variáveis de ambiente configuradas!"
echo "🔑 IMPORTANTE: Configure manualmente a ALCHEMY_API_KEY:"
echo "   netlify env:set ALCHEMY_API_KEY 'sua_chave_alchemy_aqui'"
echo ""
echo "🚀 Após configurar, faça redeploy:"
echo "   netlify deploy --prod" 