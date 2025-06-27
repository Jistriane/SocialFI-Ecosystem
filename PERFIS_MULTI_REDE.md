<!--
Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
Criado do zero por mim. Removal of this notice is prohibited for 10 years.
-->

# 👤 Perfis Multi-Rede - SocialFI Ecosystem

## 📋 Visão Geral

O SocialFI Ecosystem agora suporta múltiplas redes blockchain, e **cada rede requer seu próprio perfil**. Isso significa que você precisa criar um perfil separado para cada rede que deseja usar.

## 🌐 Redes Suportadas

### 1. **Ethereum Sepolia Testnet**
- **Chain ID:** 11155111
- **RPC:** `https://eth-sepolia.g.alchemy.com/v2/[API_KEY]`
- **Explorer:** https://sepolia.etherscan.io
- **Token:** SepoliaETH

### 2. **Metis Sepolia Testnet**
- **Chain ID:** 59902
- **RPC:** `https://sepolia.metisdevops.link`
- **Explorer:** https://sepolia-explorer.metisdevops.link
- **Token:** tMETIS

## 🎯 Status Atual dos Perfis

✅ **Ethereum Sepolia:** Perfil criado
- Username: `UsuarioTesteSepolia`
- Trust Score: 100
- Transação: `0x334b8c7792eacabe0ccc6cc03e3fb74acac860c4e9628526e34c5fbc04972001`

✅ **Metis Sepolia:** Perfil criado
- Username: `UsuarioTesteMetis`
- Trust Score: 100
- Transação: `0x7e1e34af978dcdf7399f81b789032635689fdff7154389c3ae4e3b44e3fafb87`

## 🚀 Como Criar Perfis

### Opção 1: Frontend (Recomendado)

1. **Conecte sua carteira** ao frontend
2. **Mude para a rede desejada** usando o seletor de rede
3. **Visualize o aviso** que aparece quando não há perfil
4. **Clique em "Criar Perfil"** para criar automaticamente

### Opção 2: Scripts de Terminal

#### Para Ethereum Sepolia:
```bash
node scripts/create-test-profile-sepolia.js
```

#### Para Metis Sepolia:
```bash
node scripts/create-test-profile-metis.js
```

#### Para outras redes:
```bash
node scripts/create-test-profile.js
```

## 🔧 Detalhes Técnicos

### Endereços dos Contratos

#### Ethereum Sepolia (11155111)
```
RewardsToken:  0x55c8231d1c0b93d763bc01Fa4f5f9fa1424eaaF8
TrustChain:    0x95D41cc1dD95d0C40e401987f4Bc0a7BB2343184
TradeConnect:  0x564a7a43A779d0Ebc9a0E9e9A1B8ed1583338706
GovGame:       0x7123c8538953Ab1F3Fe9ea83722f6e7133DDF9f8
EcosystemHub:  0x8204C13B075e7E90C23C7117bAF31065CE02783b
```

#### Metis Sepolia (59902)
```
RewardsToken:  0x2a1df9d5b7D277a614607b4d8C82f3d085638751
TrustChain:    0xA6207a47E5D57f905A36756A4681607F12E66239
TradeConnect:  0xD0F5BAD2919ccC87583F7AeCb8ea0C12f141AFdf
GovGame:       0xf88d37494887b4AB0e1221b73A8056DB61538e85
EcosystemHub:  0x86A6FA81b7bA20E9B430613F820583a8473471aB
```

## ⚠️ Avisos Importantes

### 1. **Perfil por Rede**
- Cada rede blockchain é independente
- Você precisa criar um perfil em cada rede que deseja usar
- Os perfis não são sincronizados entre redes

### 2. **Tokens para Gas**
- **Ethereum Sepolia:** Precisa de SepoliaETH
- **Metis Sepolia:** Precisa de tMETIS
- Certifique-se de ter saldo suficiente antes de criar o perfil

### 3. **Detecção Automática**
- O frontend detecta automaticamente se você tem perfil na rede atual
- Um aviso colorido aparece quando você precisa criar um perfil
- O aviso mostra instruções específicas para cada rede

## 🎨 Interface do Usuário

### Avisos Visuais
- **🔵 Azul:** Ethereum Sepolia
- **🟢 Verde:** Metis Sepolia
- **⚪ Cinza:** Outras redes

### Informações Exibidas
- Nome da rede atual
- Status do perfil (existe/não existe)
- Instruções para criar perfil
- Scripts específicos para cada rede
- Lembretes sobre gas

## 🔍 Verificação do Sistema

Para verificar se tudo está funcionando corretamente:

```bash
node scripts/verify-multi-network.js
```

Este script verifica:
- Conectividade com todas as redes
- Status dos contratos deployados
- Blocos mais recentes
- Integridade do sistema

## 📱 Uso no Frontend

1. **Abra o frontend:** http://localhost:3001
2. **Conecte sua carteira**
3. **Mude entre redes** usando o seletor
4. **Observe os avisos** quando não há perfil
5. **Crie perfis conforme necessário**

## 🛠️ Solução de Problemas

### "Profile does not exist"
- ✅ **Solução:** Crie um perfil na rede atual
- Use o botão no frontend ou execute o script correspondente

### "Insufficient funds"
- ✅ **Solução:** Obtenha tokens da rede através de faucets
- Ethereum Sepolia: Use faucets oficiais
- Metis Sepolia: Use o faucet oficial da Metis

### "Wrong network"
- ✅ **Solução:** Mude para a rede correta na sua carteira
- Use o seletor de rede no frontend

## 📈 Próximos Passos

- [ ] Adicionar mais redes testnets
- [ ] Implementar sincronização de perfis (opcional)
- [ ] Melhorar UX para troca de redes
- [ ] Adicionar métricas de uso por rede

---

**📅 Última atualização:** 26/06/2025
**✅ Status:** Totalmente funcional em ambas as redes 