// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import dotenv from 'dotenv';
import path from 'path';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

interface Config {
  env: string;
  port: number;
  corsOrigin: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  logLevel: string;
  contracts: {
    trustChainAddress: string;
    tradeConnectAddress: string;
    govGameAddress: string;
  };
  networks: {
    metis: {
      rpcUrl: string;
      chainId: number;
      explorerUrl: string;
    };
    ethereum: {
      rpcUrl: string;
      chainId: number;
      explorerUrl: string;
    };
  };
  alchemyApiKey: string;
  chainId: number;
  socketPath: string;
  socketPort: number;
}

export const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3002', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  logLevel: process.env.LOG_LEVEL || 'info',
  contracts: {
    trustChainAddress: process.env.TRUST_CHAIN_ADDRESS || '',
    tradeConnectAddress: process.env.TRADE_CONNECT_ADDRESS || '',
    govGameAddress: process.env.GOV_GAME_ADDRESS || ''
  },
  networks: {
    metis: {
      rpcUrl: 'https://hyperion-testnet.metisdevops.link',
      chainId: 133717,
      explorerUrl: 'https://hyperion-testnet-explorer.metisdevops.link'
    },
    ethereum: {
      rpcUrl: process.env.ALCHEMY_API_KEY 
        ? `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        : 'https://sepolia.infura.io/v3/',
      chainId: 11155111,
      explorerUrl: 'https://sepolia.etherscan.io'
    }
  },
  alchemyApiKey: process.env.ALCHEMY_API_KEY || '',
  chainId: parseInt(process.env.CHAIN_ID || '11155111', 10), // Ethereum Sepolia por padrão
  socketPath: process.env.SOCKET_PATH || '/socket.io',
  socketPort: parseInt(process.env.SOCKET_PORT || '3003', 10)
};

export default config;
