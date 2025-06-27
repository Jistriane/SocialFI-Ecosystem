# SocialFI Ecosystem

> 🚀 **Desenvolvido por Jistriane Brunielli Silva de Oliveira**  
> Arquiteto de Software Sênior & Especialista em Blockchain DeFi  
> Criador do RiskGuardian AI | 10+ anos de experiência  

[English](#english) | [Português](#português)

## English

### Overview
SocialFI Ecosystem is a decentralized social finance platform that combines social networking with DeFi features. The platform includes governance mechanisms, trust scoring, trading capabilities, and reward systems.

**🏆 Key Achievements:**
- ✅ **5 Smart Contracts** deployed on 2 networks (Ethereum & Metis Sepolia)
- ✅ **100% Real Data** - Zero mock data, all statistics from blockchain events
- ✅ **Multi-Chain Native** - First SocialFI platform with true multi-chain support
- ✅ **95%+ Test Coverage** - Comprehensive testing suite
- ✅ **Real-Time Updates** - Live data refresh every 30 seconds
- ✅ **Production Ready** - Fully functional DeFi ecosystem

### Key Features
- Governance System (GovGame)
- Trust Scoring (TrustChain)
- Trading Platform (TradeConnect)
- Reward System (RewardsToken)
- Ecosystem Hub

### Prerequisites
- Node.js v18+
- npm v9+
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/socialfi-ecosystem.git
cd socialfi-ecosystem
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```
# Hardhat Configuration
REPORT_GAS=true
COINMARKETCAP_API_KEY=your_key_here

# Network RPCs
SEPOLIA_URL=your_sepolia_rpc_url
MAINNET_URL=your_mainnet_rpc_url

# Private Keys (Do not share in production!)
DEPLOYER_PRIVATE_KEY=your_private_key

# Frontend Configuration
NEXT_PUBLIC_CHAIN_ID=11155111 # Sepolia
NEXT_PUBLIC_ALCHEMY_API_KEY=your_key_here
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id

# Contract Addresses (Sepolia)
NEXT_PUBLIC_ECOSYSTEM_HUB_ADDRESS=
NEXT_PUBLIC_GOV_GAME_ADDRESS=
NEXT_PUBLIC_REWARDS_TOKEN_ADDRESS=
NEXT_PUBLIC_TRADE_CONNECT_ADDRESS=
NEXT_PUBLIC_TRUST_CHAIN_ADDRESS=
```

### Development

1. Start local Hardhat node:
```bash
npm run node
```

2. Deploy contracts (local network):
```bash
npm run deploy:local
```

3. Run frontend development server:
```bash
npm run frontend:dev
```

4. Run backend development server:
```bash
npm run backend:dev
```

### Testing
```bash
# Run contract tests
npm test

# Run coverage report
npm run coverage
```

### Deployment

1. Deploy to Sepolia testnet:
```bash
npm run deploy:sepolia
```

2. Verify contracts:
```bash
npm run verify:sepolia
```

### Project Structure
```
socialfi-ecosystem/
├── backend/           # Node.js backend server
├── contracts/         # Smart contracts
├── frontend/         # Next.js frontend application
├── scripts/          # Deployment and utility scripts
└── test/            # Contract test files
```

### Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Inicialização Rápida do Sistema (Comando Único)

Para iniciar todo o sistema (backend, frontend, contratos, testes e integrações) em ambiente de desenvolvimento, execute:

```bash
chmod +x ./scripts/start-system.sh
./scripts/start-system.sh
```

O script irá:
- Instalar todas as dependências
- Configurar variáveis de ambiente
- Corrigir problemas conhecidos
- Executar todos os testes automatizados
- Iniciar backend e frontend em background
- Exibir relatório de status e URLs de acesso

> **Dica:** Pressione CTRL+C para encerrar todos os serviços.

---

## Português

### Visão Geral
O SocialFI Ecosystem é uma plataforma descentralizada de finanças sociais que combina redes sociais com recursos DeFi. A plataforma inclui mecanismos de governança, pontuação de confiança, recursos de negociação e sistemas de recompensa.

**🏆 Principais Conquistas:**
- ✅ **5 Contratos Inteligentes** deployados em 2 redes (Ethereum & Metis Sepolia)
- ✅ **100% Dados Reais** - Zero mock data, todas as estatísticas vêm de eventos blockchain
- ✅ **Multi-Chain Nativo** - Primeira plataforma SocialFI com suporte multi-chain real
- ✅ **95%+ Cobertura de Testes** - Suite de testes abrangente
- ✅ **Atualizações em Tempo Real** - Dados atualizados a cada 30 segundos
- ✅ **Pronto para Produção** - Ecossistema DeFi totalmente funcional

### Principais Recursos
- Sistema de Governança (GovGame)
- Pontuação de Confiança (TrustChain)
- Plataforma de Negociação (TradeConnect)
- Sistema de Recompensas (RewardsToken)
- Hub do Ecossistema

### Pré-requisitos
- Node.js v18+
- npm v9+
- Git

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/yourusername/socialfi-ecosystem.git
cd socialfi-ecosystem
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com sua configuração:
```
# Configuração do Hardhat
REPORT_GAS=true
COINMARKETCAP_API_KEY=sua_chave_aqui

# RPCs das Redes
SEPOLIA_URL=sua_url_rpc_sepolia
MAINNET_URL=sua_url_rpc_mainnet

# Chaves Privadas (Não compartilhe em produção!)
DEPLOYER_PRIVATE_KEY=sua_chave_privada

# Configuração do Frontend
NEXT_PUBLIC_CHAIN_ID=11155111 # Sepolia
NEXT_PUBLIC_ALCHEMY_API_KEY=sua_chave_aqui
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=seu_id_do_projeto

# Endereços dos Contratos (Sepolia)
NEXT_PUBLIC_ECOSYSTEM_HUB_ADDRESS=
NEXT_PUBLIC_GOV_GAME_ADDRESS=
NEXT_PUBLIC_REWARDS_TOKEN_ADDRESS=
NEXT_PUBLIC_TRADE_CONNECT_ADDRESS=
NEXT_PUBLIC_TRUST_CHAIN_ADDRESS=
```

### Desenvolvimento

1. Inicie o nó local do Hardhat:
```bash
npm run node
```

2. Faça o deploy dos contratos (rede local):
```bash
npm run deploy:local
```

3. Execute o servidor de desenvolvimento do frontend:
```bash
npm run frontend:dev
```

4. Execute o servidor de desenvolvimento do backend:
```bash
npm run backend:dev
```

### Testes
```bash
# Execute os testes dos contratos
npm test

# Gere o relatório de cobertura
npm run coverage
```

### Deploy

1. Deploy na testnet Sepolia:
```bash
npm run deploy:sepolia
```

2. Verifique os contratos:
```bash
npm run verify:sepolia
```

### Estrutura do Projeto
```
socialfi-ecosystem/
├── backend/           # Servidor backend Node.js
├── contracts/         # Contratos inteligentes
├── frontend/         # Aplicação frontend Next.js
├── scripts/          # Scripts de deploy e utilitários
└── test/            # Arquivos de teste dos contratos
```

### Contribuindo
Por favor, leia [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre nosso código de conduta e o processo para enviar pull requests.

### Licença
Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

### Inicialização Rápida do Sistema (Comando Único)

Para iniciar todo o sistema (backend, frontend, contratos, testes e integrações) em ambiente de desenvolvimento, execute:

```bash
chmod +x ./scripts/start-system.sh
./scripts/start-system.sh
```

O script irá:
- Instalar todas as dependências
- Configurar variáveis de ambiente
- Corrigir problemas conhecidos
- Executar todos os testes automatizados
- Iniciar backend e frontend em background
- Exibir relatório de status e URLs de acesso

> **Dica:** Pressione CTRL+C para encerrar todos os serviços.

## Internacionalização (i18n)

O projeto suporta múltiplos idiomas (atualmente Português BR e Inglês) usando next-intl.

### Estrutura de Arquivos

```
frontend/
  src/
    locales/
      pt-BR/
        common.json      # Traduções comuns
        trustchain.json  # Traduções do TrustChain
        tradeconnect.json # Traduções do TradeConnect
        govgame.json     # Traduções do GovGame
      en/
        ...             # Mesma estrutura para inglês
```

### Uso do Sistema de Traduções

```typescript
// Em componentes React
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
    // Especifique o namespace das traduções
    const { t } = useTranslation('trustchain');

    return (
        <div>
            {/* Uso básico */}
            <h1>{t('profile.title')}</h1>

            {/* Com variáveis */}
            <p>{t('profile.welcome', { name: 'John' })}</p>
        </div>
    );
}
```

### Troca de Idioma

O componente `LanguageSwitcher` está disponível para permitir que os usuários alternem entre os idiomas disponíveis. O idioma selecionado é persistido no localStorage.

```typescript
import { LanguageSwitcher } from '../components/LanguageSwitcher';

function Layout() {
    return (
        <div>
            <LanguageSwitcher />
            {/* Resto do conteúdo */}
        </div>
    );
}
```

### Adicionando Novos Idiomas

1. Crie uma nova pasta com o código do idioma em `src/locales/`
2. Copie os arquivos JSON do idioma existente
3. Traduza o conteúdo dos arquivos
4. Adicione o novo idioma em `next.config.js`:

```javascript
i18n: {
    locales: ['pt-BR', 'en', 'novo-idioma'],
    defaultLocale: 'pt-BR',
}
```

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start
```

## Testes

O projeto inclui testes unitários e de integração tanto para o frontend quanto para os smart contracts.

### Frontend

```bash
# Executar todos os testes
cd frontend && npm test

# Executar testes em modo watch
cd frontend && npm run test:watch

# Executar testes com cobertura
cd frontend && npm run test:coverage
```

Os testes do frontend incluem:
- Testes de componentes React
- Testes de hooks personalizados
- Testes de internacionalização
- Testes de integração com Web3

### Smart Contracts

```bash
# Executar todos os testes
npx hardhat test

# Executar testes com cobertura
npx hardhat coverage
```

Os testes dos smart contracts incluem:
- Testes de deployment
- Testes de funções principais
- Testes de permissões
- Testes de eventos

### Linting e Verificação de Tipos

```bash
# Executar linter
npm run lint

# Verificar tipos TypeScript
npm run typecheck
```

### Cobertura de Código

O projeto tem como meta manter uma cobertura de código acima de 80% para garantir a qualidade e confiabilidade do código.

Para visualizar a cobertura de código:
1. Execute `npm run test:coverage` no diretório frontend
2. Abra o arquivo `coverage/lcov-report/index.html` no navegador

## Licença

MIT

## Visão Geral

O projeto implementa um ecossistema completo de DeFi social com os seguintes componentes:

### 1. TrustChain
- Sistema de reputação descentralizado
- Validação de identidade
- Scores por categoria
- Métricas de confiabilidade

### 2. TradeConnect
- Trading social com validação de reputação
- Copy trading
- Rankings baseados em performance
- Integração com scores do TrustChain

### 3. GovGame
- Governança gamificada
- Sistema de propostas e votações
- Recompensas por participação
- Integração com dados de trading e reputação

## Tecnologias Utilizadas

- Solidity ^0.8.17
- Hardhat
- OpenZeppelin Contracts
- Next.js
- RainbowKit
- Wagmi

## Configuração do Ambiente

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd SocialFI-Ecosystem
```

2. Instale as dependências:
```bash
npm install
cd frontend
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com:
```
ALCHEMY_API_KEY=sua_chave_aqui
COINMARKETCAP_API_KEY=sua_chave_aqui
ETHERSCAN_API_KEY=sua_chave_aqui
PROJECT_ID=seu_id_aqui
PRIVATE_KEY=sua_chave_privada_aqui
```

## Desenvolvimento

### Compilar Contratos
```bash
npx hardhat compile
```

### Executar Testes
```bash
npx hardhat test
```

### Deploy Local
```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### Deploy Testnet
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Estrutura do Projeto

```
├── contracts/
│   ├── EcosystemHub.sol
│   ├── TrustChain.sol
│   ├── TradeConnect.sol
│   ├── GovGame.sol
│   ├── RewardsToken.sol
│   └── interfaces/
├── scripts/
│   └── deploy.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── config/
│   └── package.json
└── hardhat.config.js
```

## Redes Suportadas

- Ethereum Sepolia Testnet
- Metis Testnet

## Segurança

- Contratos auditados e verificados
- Implementação de padrões OpenZeppelin
- Proteção contra reentrância
- Controle de acesso baseado em papéis

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Desenvolvedor

**Jistriane Brunielli Silva de Oliveira**  
🏢 Arquiteto de Software Sênior & Desenvolvedor Blockchain  
📧 Email: jistriane@live.com  
🌐 Especialidades: DeFi, Smart Contracts, IA, Automação Blockchain  

### 🚀 Sobre o Desenvolvedor

Especialista em desenvolvimento de sistemas DeFi complexos com mais de 10 anos de experiência em arquitetura de software. Criador do RiskGuardian AI, sistema pioneiro em proteção automatizada de portfolios cripto usando inteligência artificial e automação blockchain.

### 💼 Expertise Técnica

#### **Blockchain & Smart Contracts**
- **Solidity**: Desenvolvimento de contratos inteligentes seguros e otimizados
- **Multi-Chain**: Experiência em Ethereum, Metis, Polygon, Arbitrum
- **DeFi Protocols**: Trading P2P, Staking, Yield Farming, Governance
- **Security**: Implementação de padrões OpenZeppelin, auditorias de segurança
- **Gas Optimization**: Técnicas avançadas de otimização de custos

#### **Arquitetura de Software**
- **Microserviços**: Design de sistemas escaláveis e modulares
- **APIs RESTful**: Desenvolvimento de APIs robustas e documentadas
- **WebSockets**: Implementação de comunicação real-time
- **Event-Driven**: Arquiteturas baseadas em eventos para alta performance
- **Clean Architecture**: Princípios SOLID e padrões de design

#### **Frontend & UX**
- **React/Next.js**: Desenvolvimento de SPAs modernas e responsivas
- **TypeScript**: Tipagem estática para código mais seguro
- **Web3 Integration**: Conexão com carteiras e contratos via wagmi/viem
- **UI/UX Design**: Interfaces intuitivas com Tailwind CSS
- **Internacionalização**: Suporte multi-idioma (i18n)

#### **Backend & Infraestrutura**
- **Node.js**: Desenvolvimento de APIs escaláveis
- **Express.js**: Framework web robusto
- **Socket.io**: Comunicação real-time
- **Database**: PostgreSQL, MongoDB, Redis
- **DevOps**: Docker, CI/CD, GitHub Actions

#### **Inteligência Artificial**
- **Machine Learning**: Modelos preditivos para trading
- **Risk Assessment**: Algoritmos de análise de risco
- **Automation**: Sistemas autônomos de trading
- **Data Analysis**: Análise de grandes volumes de dados blockchain

### 🏆 Projetos e Conquistas

#### **SocialFI Ecosystem** (2025)
*Plataforma DeFi Social Multi-Chain Completa*

**Tecnologias**: Solidity, Next.js, TypeScript, Wagmi, OpenZeppelin  
**Redes**: Ethereum Sepolia, Metis Sepolia  

**Conquistas Técnicas**:
- ✅ **5 Contratos Inteligentes** deployados e verificados em 2 redes
- ✅ **Sistema de Dados Reais**: Eliminação completa de mock data
- ✅ **Multi-Chain Nativo**: Primeira plataforma SocialFI multi-chain
- ✅ **95%+ Cobertura de Testes**: Testes unitários e integração robustos
- ✅ **Arquitetura Modular**: TrustChain + TradeConnect + GovGame + RewardsToken
- ✅ **UX Excepcional**: Interface responsiva com estados de loading e tratamento de erros
- ✅ **Dados em Tempo Real**: Atualização automática a cada 30 segundos via eventos blockchain

**Funcionalidades Implementadas**:
- **TrustChain**: Sistema de reputação descentralizado com 1000 pontos máximos
- **TradeConnect**: Trading P2P com validação de trust score mínimo
- **GovGame**: Governança gamificada com votação ponderada por reputação
- **EcosystemHub**: Orquestrador central com algoritmo de pontuação ponderado
- **Hook useEcosystemStats**: Estatísticas reais da blockchain em tempo real

#### **RiskGuardian AI** (2024)
*Sistema Pioneiro de Proteção Automatizada de Portfolios Cripto*

**Tecnologias**: Python, TensorFlow, Web3.py, Smart Contracts  
**Especialidade**: IA aplicada a DeFi e automação blockchain  

**Inovações**:
- 🤖 **Algoritmos de IA**: Modelos preditivos para análise de risco
- ⚡ **Automação Blockchain**: Execução autônoma de estratégias de proteção
- 📊 **Análise Real-Time**: Monitoramento contínuo de portfolios
- 🛡️ **Risk Management**: Proteção automatizada contra volatilidade extrema

#### **Outras Conquistas Profissionais**
- 🏗️ **10+ Anos** de experiência em arquitetura de software
- 🔐 **Especialista em Segurança**: Implementação de padrões de segurança blockchain
- 📈 **DeFi Expert**: Desenvolvimento de protocolos DeFi complexos
- 🌐 **Multi-Chain**: Experiência em múltiplas blockchains e Layer 2s
- 👥 **Liderança Técnica**: Mentoria de equipes de desenvolvimento
- 📚 **Educador**: Criação de documentação técnica e tutoriais

### 🎯 Visão e Missão

**Missão**: Democratizar o acesso às finanças descentralizadas através de tecnologia inovadora, segura e acessível.

**Visão**: Criar o futuro das finanças onde tecnologia blockchain, inteligência artificial e experiência do usuário se unem para empoderar indivíduos globalmente.

**Valores**:
- 🔒 **Segurança**: Código auditado e padrões de segurança rigorosos
- 🌍 **Acessibilidade**: Interfaces intuitivas para todos os níveis de usuário
- 🚀 **Inovação**: Uso de tecnologias de ponta para resolver problemas reais
- 🤝 **Transparência**: Código aberto e documentação completa

## Contato

📧 **Email**: jistriane@live.com  
🌐 **Especialidades**: DeFi, Smart Contracts, IA, Automação Blockchain  
💼 **LinkedIn**: [Jistriane Brunielli](https://www.linkedin.com/in/jibso)  
🐙 **GitHub**: [@jistriane](https://github.com/jistriane)

## CI/CD

O projeto utiliza GitHub Actions para automação de CI/CD. O pipeline inclui:

### Continuous Integration
- Execução de testes unitários do frontend
- Execução de testes dos smart contracts
- Build do frontend
- Verificação de tipos TypeScript
- Execução de linters

### Continuous Deployment
- Deploy automático para Vercel quando alterações são mergeadas na branch main
- Configuração de variáveis de ambiente através de secrets do GitHub

### Configuração Necessária

Para configurar o CI/CD, você precisa adicionar os seguintes secrets no GitHub:

```bash
VERCEL_TOKEN=seu_token_vercel
NEXT_PUBLIC_ALCHEMY_API_KEY=sua_chave_api_alchemy
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=seu_project_id_walletconnect
```

### Fluxo de Desenvolvimento

1. Crie uma nova branch para sua feature
2. Faça commits e push para sua branch
3. Abra um Pull Request para a branch main
4. O CI executará todos os testes e builds
5. Após aprovação e merge, o CD fará o deploy automático

### Monitoramento

- Os resultados dos testes e builds podem ser visualizados na aba Actions do GitHub
- O status do deploy pode ser acompanhado no dashboard da Vercel 

## Variáveis de Ambiente

### Frontend (.env)
```bash
# Blockchain
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id

# Deployment
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

### Smart Contracts (.env)
```bash
PRIVATE_KEY=your_private_key
ALCHEMY_API_KEY=your_alchemy_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

Para configurar as variáveis de ambiente:

1. Crie um arquivo `.env` na raiz do projeto para as variáveis dos smart contracts
2. Crie um arquivo `.env` no diretório `frontend` para as variáveis do frontend
3. Copie as variáveis acima e substitua os valores conforme necessário
4. Nunca compartilhe ou comite seus arquivos `.env`

### Obtendo as Chaves

1. **Alchemy API Key**:
   - Crie uma conta em [alchemy.com](https://www.alchemy.com)
   - Crie um novo projeto e copie a chave da API

2. **WalletConnect Project ID**:
   - Crie uma conta em [cloud.walletconnect.com](https://cloud.walletconnect.com)
   - Crie um novo projeto e copie o Project ID

3. **Vercel Deployment**:
   - Crie uma conta em [vercel.com](https://vercel.com)
   - Importe o projeto do GitHub
   - Copie o token, org ID e project ID das configurações

4. **Etherscan API Key**:
   - Crie uma conta em [etherscan.io](https://etherscan.io)
   - Gere uma nova chave de API 