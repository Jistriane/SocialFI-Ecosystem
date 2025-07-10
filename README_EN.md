<!--
Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
Criado do zero por mim. Removal of this notice is prohibited for 10 years.
-->

# SocialFI Ecosystem

> 🚀 **Developed by Jistriane Brunielli Silva de Oliveira**  
> Senior Software Architect & Blockchain DeFi Specialist  
> Creator of RiskGuardian AI | 10+ years of experience  

[Português](README.md) | [English](#english)

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
- 🚀 **LIVE ON TESTNET** - https://frontend-nbayoxu23-jistrianes-projects.vercel.app
- 🔧 **BACKEND ACTIVE** - https://socialfi-backend.netlify.app

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

#### **🚀 LIVE TESTNET DEPLOYMENT**
**Frontend URL**: https://frontend-nbayoxu23-jistrianes-projects.vercel.app  
**Backend URL**: https://socialfi-backend.netlify.app  
**Health Check**: https://socialfi-backend.netlify.app/health  
**Status**: ✅ ACTIVE - Complete system running (Frontend + Backend + Contracts)  
**Networks**: Ethereum Sepolia + Metis Sepolia with native multi-chain support

#### **Deployment Architecture**
- **Frontend**: Vercel (Static Site Generation)
- **Backend**: Netlify Functions (Serverless)
- **Contracts**: Multi-chain (Ethereum + Metis Sepolia)
- **Communication**: CORS configured between frontend and backend
- **APIs**: RESTful endpoints for authentication and blockchain data

#### **Contract Addresses**

**Ethereum Sepolia (Chain ID: 11155111)**:
- RewardsToken: `0x55c8231d1c0b93d763bc01Fa4f5f9fa1424eaaF8`
- TrustChain: `0x95D41cc1dD95d0C40e401987f4Bc0a7BB2343184`
- TradeConnect: `0x564a7a43A779d0Ebc9a0E9e9A1B8ed1583338706`
- GovGame: `0x7123c8538953Ab1F3Fe9ea83722f6e7133DDF9f8`
- EcosystemHub: `0x8204C13B075e7E90C23C7117bAF31065CE02783b`

**Metis Sepolia (Chain ID: 59902)**:
- RewardsToken: `0x2a1df9d5b7D277a614607b4d8C82f3d085638751`
- TrustChain: `0xA6207a47E5D57f905A36756A4681607F12E66239`
- TradeConnect: `0xD0F5BAD2919ccC87583F7AeCb8ea0C12f141AFdf`
- GovGame: `0xf88d37494887b4AB0e1221b73A8056DB61538e85`
- EcosystemHub: `0x86A6FA81b7bA20E9B430613F820583a8473471aB`

#### **Manual Deployment**

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

## 👨‍💻 Developer

**Jistriane Brunielli Silva de Oliveira**  
🏢 Senior Software Architect & Blockchain Developer  
📧 Email: jistriane@live.com  
🌐 Specialties: DeFi, Smart Contracts, AI, Blockchain Automation  

### 🚀 About the Developer

Specialist in developing complex DeFi systems with over 10 years of experience in software architecture. Creator of RiskGuardian AI, a pioneering system for automated crypto portfolio protection using artificial intelligence and blockchain automation.

### 💼 Technical Expertise

#### **Blockchain & Smart Contracts**
- **Solidity**: Development of secure and optimized smart contracts
- **Multi-Chain**: Experience in Ethereum, Metis, Polygon, Arbitrum
- **DeFi Protocols**: P2P Trading, Staking, Yield Farming, Governance
- **Security**: Implementation of OpenZeppelin standards, security audits
- **Gas Optimization**: Advanced cost optimization techniques

#### **Software Architecture**
- **Microservices**: Design of scalable and modular systems
- **RESTful APIs**: Development of robust and documented APIs
- **WebSockets**: Implementation of real-time communication
- **Event-Driven**: Event-based architectures for high performance
- **Clean Architecture**: SOLID principles and design patterns

#### **Frontend & UX**
- **React/Next.js**: Development of modern and responsive SPAs
- **TypeScript**: Static typing for safer code
- **Web3 Integration**: Wallet and contract connection via wagmi/viem
- **UI/UX Design**: Intuitive interfaces with Tailwind CSS
- **Internationalization**: Multi-language support (i18n)

#### **Backend & Infrastructure**
- **Node.js**: Development of scalable APIs
- **Express.js**: Robust web framework
- **Socket.io**: Real-time communication
- **Database**: PostgreSQL, MongoDB, Redis
- **DevOps**: Docker, CI/CD, GitHub Actions

#### **Artificial Intelligence**
- **Machine Learning**: Predictive models for trading
- **Risk Assessment**: Risk analysis algorithms
- **Automation**: Autonomous trading systems
- **Data Analysis**: Analysis of large blockchain data volumes

### 🏆 Projects and Achievements

#### **SocialFI Ecosystem** (2025)
*Complete Multi-Chain Social DeFi Platform*

**Technologies**: Solidity, Next.js, TypeScript, Wagmi, OpenZeppelin  
**Networks**: Ethereum Sepolia, Metis Sepolia  

**Technical Achievements**:
- ✅ **5 Smart Contracts** deployed and verified on 2 networks
- ✅ **Real Data System**: Complete elimination of mock data
- ✅ **Native Multi-Chain**: First multi-chain SocialFI platform
- ✅ **95%+ Test Coverage**: Robust unit and integration tests
- ✅ **Modular Architecture**: TrustChain + TradeConnect + GovGame + RewardsToken
- ✅ **Exceptional UX**: Responsive interface with loading states and error handling
- ✅ **Real-Time Data**: Automatic update every 30 seconds via blockchain events

**Implemented Features**:
- **TrustChain**: Decentralized reputation system with 1000 maximum points
- **TradeConnect**: P2P trading with minimum trust score validation
- **GovGame**: Gamified governance with reputation-weighted voting
- **EcosystemHub**: Central orchestrator with weighted scoring algorithm
- **useEcosystemStats Hook**: Real-time blockchain statistics

#### **RiskGuardian AI** (2024)
*Pioneering Automated Crypto Portfolio Protection System*

**Technologies**: Python, TensorFlow, Web3.py, Smart Contracts  
**Specialty**: AI applied to DeFi and blockchain automation  

**Innovations**:
- 🤖 **AI Algorithms**: Predictive models for risk analysis
- ⚡ **Blockchain Automation**: Autonomous execution of protection strategies
- 📊 **Real-Time Analysis**: Continuous portfolio monitoring
- 🛡️ **Risk Management**: Automated protection against extreme volatility

#### **Other Professional Achievements**
- 🏗️ **10+ Years** of software architecture experience
- 🔐 **Security Expert**: Implementation of blockchain security standards
- 📈 **DeFi Expert**: Development of complex DeFi protocols
- 🌐 **Multi-Chain**: Experience in multiple blockchains and Layer 2s
- 👥 **Technical Leadership**: Mentoring development teams
- 📚 **Educator**: Creation of technical documentation and tutorials

### 🎯 Vision and Mission

**Mission**: Democratize access to decentralized finance through innovative, secure, and accessible technology.

**Vision**: Create the future of finance where blockchain technology, artificial intelligence, and user experience unite to empower individuals globally.

**Values**:
- 🔒 **Security**: Audited code and rigorous security standards
- 🌍 **Accessibility**: Intuitive interfaces for all user levels
- 🚀 **Innovation**: Use of cutting-edge technologies to solve real problems
- 🤝 **Transparency**: Open source code and complete documentation

## Contact

📧 **Email**: jistriane@live.com  
🌐 **Specialties**: DeFi, Smart Contracts, AI, Blockchain Automation  
💼 **LinkedIn**: [Jistriane Brunielli](https://www.linkedin.com/in/jibso)  
🐙 **GitHub**: [@jistriane](https://github.com/jistriane)

## License

MIT 