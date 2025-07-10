// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { createConfig, configureChains, Chain } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { injectedWallet, metaMaskWallet } from '@rainbow-me/rainbowkit/wallets'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'

// Configurar Project ID do WalletConnect (usar valor padrão se não definido)
const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo-project-id'

if (!process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
  console.warn(
    '⚠️  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID não definida. Usando valor padrão para desenvolvimento.',
  )
}

// Definir a rede Metis Sepolia Testnet (sem ENS para evitar erros)
const metisSepoliaTestnet: Chain = {
  id: 59902,
  name: 'Metis Sepolia Testnet',
  network: 'metis-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'tMETIS',
    symbol: 'tMETIS',
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.metisdevops.link'],
    },
    public: {
      http: ['https://sepolia.metisdevops.link'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Metis Sepolia Explorer',
      url: 'https://sepolia-explorer.metisdevops.link',
    },
  },
  testnet: true,
  // IMPORTANTE: Sem contratos ENS para evitar erros
  contracts: {},
}

// Definir Ethereum Sepolia customizado (também sem ENS)
const ethereumSepoliaCustom: Chain = {
  ...sepolia,
  // Remover contratos ENS para evitar tentativas de resolução
  contracts: {},
}

// Configurar chains e providers (ambas sem ENS)
const { chains, publicClient } = configureChains(
  [ethereumSepoliaCustom, metisSepoliaTestnet],
  [
    ...(process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
      ? [alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY })]
      : []),
    publicProvider(),
  ],
)

// Configurar carteiras
const connectors = connectorsForWallets([
  {
    groupName: 'Recomendadas',
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ projectId: walletConnectProjectId, chains }),
    ],
  },
])

// Criar configuração do wagmi sem ENS
export const config = createConfig({
  autoConnect: false,
  connectors,
  publicClient,
})

export { chains }

// Funções utilitárias
export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function getNetworkName(chainId: number): string {
  switch (chainId) {
    case 11155111:
      return 'Ethereum Sepolia'
    case 59902:
      return 'Metis Sepolia'
    default:
      return 'Rede Desconhecida'
  }
}

// Tipos para contratos
export interface ContractInfo {
  address: string
  abi: any
}

export interface TokenInfo {
  name: string
  symbol: string
  decimals: number
}

export interface NetworkInfo {
  chainId: number
  name: string
  symbol: string
  rpcUrl: string
  explorerUrl: string
}

export interface TransactionInfo {
  txHash: string
  chainId: number
}

// Função para verificar se um endereço de contrato é válido
export function isValidContractAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// Função para verificar se um endereço de carteira é válido
export function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// Função para formatar um valor em wei para ether
export function formatEther(wei: bigint): string {
  return (Number(wei) / 1e18).toFixed(6)
}

// Função para formatar um valor em ether para wei
export function parseEther(ether: string): bigint {
  return BigInt(Math.floor(Number(ether) * 1e18))
}

// Função para verificar se a rede é suportada
export function isSupportedNetwork(chainId: number): boolean {
  return chainId === 59902 || chainId === 11155111
}

// Função para obter a URL do explorer baseado no chainId
export function getExplorerUrl(chainId: number): string {
  switch (chainId) {
    case 59902:
      return 'https://sepolia-explorer.metisdevops.link'
    case 11155111:
      return 'https://sepolia.etherscan.io'
    default:
      return ''
  }
}

// Função para obter a moeda nativa baseada no chainId
export function getNativeCurrency(chainId: number): {
  name: string
  symbol: string
  decimals: number
} {
  switch (chainId) {
    case 59902:
      return { name: 'tMETIS', symbol: 'tMETIS', decimals: 18 }
    case 11155111:
      return { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 }
    default:
      return { name: 'Unknown', symbol: 'UNK', decimals: 18 }
  }
}

// Função para obter a URL do explorer para um endereço específico
export function getAddressExplorerUrl(
  address: string,
  chainId: number,
): string {
  const baseUrl = getExplorerUrl(chainId)
  return baseUrl ? `${baseUrl}/address/${address}` : ''
}

// Função para obter a URL do explorer para uma transação específica
export function getTransactionExplorerUrl(
  txHash: string,
  chainId: number,
): string {
  const baseUrl = getExplorerUrl(chainId)
  return baseUrl ? `${baseUrl}/tx/${txHash}` : ''
}

// Função para formatar hashes de transação (0x1234...5678)
export function formatTransactionHash(hash: string): string {
  if (!hash) return ''
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

// Exportar configuração e utilitários
export default {
  chains,
  config,
  isValidContractAddress,
  isValidWalletAddress,
  getNetworkName,
  isSupportedNetwork,
  getExplorerUrl,
  getAddressExplorerUrl,
  getTransactionExplorerUrl,
  formatAddress,
  formatEther,
  parseEther,
  formatTransactionHash,
  getNativeCurrency,
}
