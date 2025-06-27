<!--
Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
Criado do zero por mim. Removal of this notice is prohibited for 10 years.
-->

# SocialFI Ecosystem Frontend

[English](#english) | [Português](#português)

## English

### Overview
Frontend application for the SocialFI Ecosystem, a decentralized social finance platform built with modern web technologies.

### Technologies
- Next.js 14+ (App Router)
- TypeScript
- Wagmi v2 + Viem
- WalletConnect
- TypeChain
- Tailwind CSS + shadcn/ui
- Recharts
- Zustand
- Socket.io
- Jest + React Testing Library

### Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy the environment variables file:
```bash
cp .env.example .env.local
```

4. Fill in your environment variables in `.env.local`

5. Generate contract types:
```bash
npm run generate-types
```

6. Start the development server:
```bash
npm run dev
```

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run linter
- `npm run test`: Run tests
- `npm run test:watch`: Run tests in watch mode
- `npm run generate-types`: Generate TypeScript types from contracts

## Português

### Visão Geral
Aplicação frontend do SocialFI Ecosystem, uma plataforma descentralizada de finanças sociais construída com tecnologias web modernas.

### Tecnologias
- Next.js 14+ (App Router)
- TypeScript
- Wagmi v2 + Viem
- WalletConnect
- TypeChain
- Tailwind CSS + shadcn/ui
- Recharts
- Zustand
- Socket.io
- Jest + React Testing Library

### Como Começar

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Copie o arquivo de variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Preencha suas variáveis de ambiente no arquivo `.env.local`

5. Gere os tipos dos contratos:
```bash
npm run generate-types
```

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

### Scripts Disponíveis
- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Compila para produção
- `npm run start`: Inicia o servidor de produção
- `npm run lint`: Executa o linter
- `npm run test`: Executa os testes
- `npm run test:watch`: Executa os testes em modo de observação
- `npm run generate-types`: Gera tipos TypeScript dos contratos 