<!--
Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
Criado do zero por mim. Removal of this notice is prohibited for 10 years.
-->

# SocialFI Ecosystem Backend

Backend da plataforma SocialFI Ecosystem, uma plataforma DeFi que integra três sistemas principais:

- **TrustChain**: Sistema de reputação baseado em blockchain
- **TradeConnect**: Plataforma de trading social
- **GovGame**: Sistema de governança gamificado

## Tecnologias Utilizadas

- Node.js
- TypeScript
- Express
- Ethers.js
- Jest
- ESLint

## Pré-requisitos

- Node.js 18+
- Conta Alchemy (para interação com a blockchain)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/socialfi-ecosystem.git
cd socialfi-ecosystem/backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp src/config/env.example .env
```

Edite o arquivo `.env` com suas configurações.

## Desenvolvimento

Para iniciar o servidor em modo de desenvolvimento:

```bash
npm run dev
```

## Build

Para compilar o projeto:

```bash
npm run build
```

Para iniciar o servidor em produção:

```bash
npm start
```

## Testes

Para executar os testes:

```bash
# Testes unitários
npm test

# Testes com watch mode
npm run test:watch

# Cobertura de testes
npm run test:coverage
```

## Linting e Verificação de Tipos

```bash
# Verificar tipos
npm run typecheck

# Executar linting
npm run lint
```

## Estrutura do Projeto

```
src/
  ├── config/         # Configurações
  ├── controllers/    # Controladores
  ├── middlewares/    # Middlewares
  ├── routes/         # Rotas da API
  ├── services/       # Lógica de negócios
  ├── test/          # Testes
  └── utils/         # Utilitários
```

## API Endpoints

### Autenticação

- `GET /api/auth/nonce/:address` - Obter nonce para autenticação
- `POST /api/auth/login` - Autenticar usuário

### TrustChain

- `GET /api/trustchain/profile/:address` - Obter perfil do usuário
- `GET /api/trustchain/leaderboard` - Obter ranking de usuários
- `POST /api/trustchain/endorse/:address` - Endossar usuário
- `POST /api/trustchain/revoke/:address` - Revogar endosso
- `GET /api/trustchain/endorsements` - Listar endossos do usuário
- `GET /api/trustchain/badges` - Listar badges do usuário

### TradeConnect

- `GET /api/tradeconnect/trades` - Listar trades
- `POST /api/tradeconnect/trades` - Criar trade
- `GET /api/tradeconnect/trades/:id` - Obter detalhes do trade
- `POST /api/tradeconnect/trades/:id/follow` - Seguir trade
- `POST /api/tradeconnect/trades/:id/unfollow` - Deixar de seguir trade

### GovGame

- `GET /api/govgame/proposals` - Listar propostas
- `POST /api/govgame/proposals` - Criar proposta
- `GET /api/govgame/proposals/:id` - Obter detalhes da proposta
- `POST /api/govgame/proposals/:id/vote` - Votar em proposta

## Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -am 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](../LICENSE) para mais detalhes. 