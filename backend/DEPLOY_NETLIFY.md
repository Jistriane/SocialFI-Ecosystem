<!--
Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
Criado do zero por mim. Removal of this notice is prohibited for 10 years.
-->

# 🚀 Deploy Backend SocialFI no Netlify

## 📋 Pré-requisitos

1. **Conta no Netlify**: https://www.netlify.com
2. **Netlify CLI instalado**:
   ```bash
   npm install -g netlify-cli
   ```
3. **Login no Netlify**:
   ```bash
   netlify login
   ```

## 🔧 Configuração Local

### 1. **Instalar Dependências**
```bash
cd backend
npm install
```

### 2. **Build do Projeto**
```bash
npm run build
```

## 🌐 Deploy via Netlify CLI

### 1. **Inicializar Projeto**
```bash
cd backend
netlify init
```

**Respostas sugeridas:**
- Create & configure a new site: **Yes**
- Team: **Sua equipe/conta pessoal**
- Site name: **socialfi-backend** (ou nome de sua escolha)
- Deploy directory: **dist**

### 2. **Configurar Variáveis de Ambiente**

No dashboard do Netlify (https://app.netlify.com):
1. Acesse seu site → **Site settings** → **Environment variables**
2. Adicione as seguintes variáveis:

```bash
NODE_ENV=production
PORT=8888
CORS_ORIGIN=https://frontend-nbayoxu23-jistrianes-projects.vercel.app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
LOG_LEVEL=info
ALCHEMY_API_KEY=your_alchemy_api_key_here
CHAIN_ID=11155111

# Contract Addresses - Ethereum Sepolia
TRUST_CHAIN_ADDRESS=0x95D41cc1dD95d0C40e401987f4Bc0a7BB2343184
TRADE_CONNECT_ADDRESS=0x564a7a43A779d0Ebc9a0E9e9A1B8ed1583338706
GOV_GAME_ADDRESS=0x7123c8538953Ab1F3Fe9ea83722f6e7133DDF9f8
REWARDS_TOKEN_ADDRESS=0x55c8231d1c0b93d763bc01Fa4f5f9fa1424eaaF8
ECOSYSTEM_HUB_ADDRESS=0x8204C13B075e7E90C23C7117bAF31065CE02783b

# Contract Addresses - Metis Sepolia
METIS_TRUST_CHAIN_ADDRESS=0xA6207a47E5D57f905A36756A4681607F12E66239
METIS_TRADE_CONNECT_ADDRESS=0xD0F5BAD2919ccC87583F7AeCb8ea0C12f141AFdf
METIS_GOV_GAME_ADDRESS=0xf88d37494887b4AB0e1221b73A8056DB61538e85
METIS_REWARDS_TOKEN_ADDRESS=0x2a1df9d5b7D277a614607b4d8C82f3d085638751
METIS_ECOSYSTEM_HUB_ADDRESS=0x86A6FA81b7bA20E9B430613F820583a8473471aB
```

### 3. **Deploy para Produção**
```bash
netlify deploy --prod
```

## 🔍 Verificação do Deploy

### 1. **Health Check**
Após o deploy, teste a URL:
```
https://SEU-SITE.netlify.app/health
```

**Resposta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-10T...",
  "service": "SocialFI Backend",
  "version": "1.0.0",
  "environment": "production",
  "networks": {
    "ethereum_sepolia": {
      "chainId": 11155111,
      "status": "active"
    },
    "metis_sepolia": {
      "chainId": 59902,
      "status": "active"
    }
  }
}
```

### 2. **Testar APIs**
```bash
# Auth endpoint
curl https://SEU-SITE.netlify.app/api/auth/health

# TrustChain endpoint
curl https://SEU-SITE.netlify.app/api/trustchain/stats
```

## 🔧 Deploy via GitHub (Automático)

### 1. **Conectar Repositório**
1. No dashboard Netlify: **New site from Git**
2. Escolha **GitHub** e selecione seu repositório
3. Configure:
   - **Base directory**: `backend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### 2. **Configurar netlify.toml**
O arquivo `netlify.toml` já está configurado no projeto.

### 3. **Deploy Automático**
Qualquer push para a branch `main` fará deploy automático.

## 📊 Monitoramento

### 1. **Logs**
```bash
netlify logs
```

### 2. **Functions**
```bash
netlify functions:list
```

### 3. **Status**
```bash
netlify status
```

## 🔧 Configuração Avançada

### 1. **Custom Domain**
```bash
netlify domains:add yourdomain.com
```

### 2. **HTTPS**
Automático no Netlify com certificados Let's Encrypt.

### 3. **Redirects**
Já configurados no `netlify.toml` para redirecionar `/api/*` para as functions.

## 🚨 Troubleshooting

### 1. **Build Errors**
```bash
# Verificar logs de build
netlify logs --level error

# Build local
npm run build
```

### 2. **Function Errors**
```bash
# Testar functions localmente
netlify dev
```

### 3. **CORS Issues**
Verifique se o `CORS_ORIGIN` está configurado corretamente nas variáveis de ambiente.

## 📋 URLs Importantes

Após o deploy você terá:
- **API Base**: `https://SEU-SITE.netlify.app/api`
- **Health Check**: `https://SEU-SITE.netlify.app/health`
- **Dashboard**: https://app.netlify.com

## ✅ Checklist Final

- [ ] Netlify CLI instalado e logado
- [ ] Projeto buildado localmente (`npm run build`)
- [ ] Site criado no Netlify
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado (`netlify deploy --prod`)
- [ ] Health check funcionando
- [ ] APIs respondendo corretamente
- [ ] CORS configurado para o frontend
- [ ] Logs sem erros críticos

## 🎯 Próximos Passos

1. **Atualizar Frontend**: Configurar URL do backend no frontend
2. **Monitoramento**: Configurar alertas de uptime
3. **Analytics**: Implementar métricas de uso
4. **Security**: Revisar configurações de segurança

---

**🎉 Seu backend SocialFI estará funcionando no Netlify!** 