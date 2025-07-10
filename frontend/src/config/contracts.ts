// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

// Auto-generated - Deploy atualizado 2025-01-27T16:30:00.000Z
import { Address } from 'viem'

// Declaração de tipos para window.ethereum
declare global {
  interface Window {
    ethereum?: {
      chainId?: string
      request?: (args: { method: string; params?: any[] }) => Promise<any>
    }
  }
}

// Função para obter endereços dos contratos via variáveis de ambiente
function getContractAddressesFromEnv() {
  return {
    // Ethereum Sepolia - Endereços deployados
    11155111: {
      RewardsToken:
        process.env.NEXT_PUBLIC_ETHEREUM_SEPOLIA_REWARDS_TOKEN ||
        '0x55c8231d1c0b93d763bc01Fa4f5f9fa1424eaaF8',
      TrustChain:
        process.env.NEXT_PUBLIC_ETHEREUM_SEPOLIA_TRUST_CHAIN ||
        '0x95D41cc1dD95d0C40e401987f4Bc0a7BB2343184',
      TradeConnect:
        process.env.NEXT_PUBLIC_ETHEREUM_SEPOLIA_TRADE_CONNECT ||
        '0x564a7a43A779d0Ebc9a0E9e9A1B8ed1583338706',
      GovGame:
        process.env.NEXT_PUBLIC_ETHEREUM_SEPOLIA_GOV_GAME ||
        '0x7123c8538953Ab1F3Fe9ea83722f6e7133DDF9f8',
      EcosystemHub:
        process.env.NEXT_PUBLIC_ETHEREUM_SEPOLIA_ECOSYSTEM_HUB ||
        '0x8204C13B075e7E90C23C7117bAF31065CE02783b',
    },
    // Metis Sepolia - Endereços deployados
    59902: {
      RewardsToken:
        process.env.NEXT_PUBLIC_METIS_SEPOLIA_REWARDS_TOKEN ||
        '0x2a1df9d5b7D277a614607b4d8C82f3d085638751',
      TrustChain:
        process.env.NEXT_PUBLIC_METIS_SEPOLIA_TRUST_CHAIN ||
        '0xA6207a47E5D57f905A36756A4681607F12E66239',
      TradeConnect:
        process.env.NEXT_PUBLIC_METIS_SEPOLIA_TRADE_CONNECT ||
        '0xD0F5BAD2919ccC87583F7AeCb8ea0C12f141AFdf',
      GovGame:
        process.env.NEXT_PUBLIC_METIS_SEPOLIA_GOV_GAME ||
        '0xf88d37494887b4AB0e1221b73A8056DB61538e85',
      EcosystemHub:
        process.env.NEXT_PUBLIC_METIS_SEPOLIA_ECOSYSTEM_HUB ||
        '0x86A6FA81b7bA20E9B430613F820583a8473471aB',
    },
  } as const
}

// Endereços dos contratos deployados por rede
export const CONTRACT_ADDRESSES = getContractAddressesFromEnv()

// Função para obter redes suportadas via variáveis de ambiente
function getSupportedNetworks(): number[] {
  const networksEnv =
    process.env.NEXT_PUBLIC_SUPPORTED_NETWORKS || '11155111,59902'
  return networksEnv
    .split(',')
    .map((n) => parseInt(n.trim()))
    .filter((n) => !isNaN(n))
}

// Função para obter rede padrão via variáveis de ambiente
function getDefaultNetwork(): number {
  const defaultEnv = process.env.NEXT_PUBLIC_DEFAULT_NETWORK

  if (defaultEnv === 'auto') {
    // Detecta automaticamente baseado na carteira conectada
    return getCurrentChainId()
  }

  const parsed = parseInt(defaultEnv || '11155111')
  return isNaN(parsed) ? 11155111 : parsed
}

// Rede padrão
export const DEFAULT_NETWORK = getDefaultNetwork()

// Redes suportadas
export const SUPPORTED_NETWORKS = getSupportedNetworks()

// Função para obter o chain ID atual dinamicamente
export function getCurrentChainId(): number {
  // Em ambiente browser, tenta usar window.ethereum
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const chainId = parseInt(window.ethereum.chainId || '0x1', 16)
      return chainId
    } catch {
      return DEFAULT_NETWORK
    }
  }
  return DEFAULT_NETWORK
}

// Função para verificar se uma rede é suportada
export function isSupportedNetwork(chainId: number): boolean {
  return SUPPORTED_NETWORKS.includes(chainId)
}

// Função para verificar se uma rede tem contratos deployados
export function hasContractsDeployed(chainId: number): boolean {
  const addresses =
    CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
  if (!addresses) return false

  // Verifica se pelo menos um contrato não é endereço zero
  return Object.values(addresses).some(
    (addr) => addr !== ('0x0000000000000000000000000000000000000000' as string),
  )
}

// Função para obter a rede com contratos deployados
export function getActiveNetwork(): number {
  const currentChainId = getCurrentChainId()

  // Se a rede atual é suportada e tem contratos, usa ela
  if (
    isSupportedNetwork(currentChainId) &&
    hasContractsDeployed(currentChainId)
  ) {
    return currentChainId
  }

  // Senão, usa a primeira rede suportada com contratos
  for (const networkId of SUPPORTED_NETWORKS) {
    if (hasContractsDeployed(networkId)) {
      return networkId
    }
  }

  // Fallback para rede padrão
  return DEFAULT_NETWORK
}

// Configuração dos contratos
interface ContractConfig {
  address: Address
  abi: any
}

// Função para obter configuração de contrato
export function getContractConfig(contractName: string): ContractConfig {
  const chainId = getActiveNetwork()
  const addresses =
    CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]

  if (!addresses) {
    throw new Error(`Endereços não encontrados para chain ID: ${chainId}`)
  }

  const address = addresses[contractName as keyof typeof addresses]
  if (
    !address ||
    address === ('0x0000000000000000000000000000000000000000' as string)
  ) {
    throw new Error(
      `Contrato ${contractName} não deployado na chain ID: ${chainId}`,
    )
  }

  // Carrega ABI dinamicamente
  let abi
  try {
    abi = require(`../contracts/artifacts/contracts/${contractName}.sol/${contractName}.json`)
  } catch (error) {
    console.warn(`ABI não encontrado para ${contractName}, usando ABI básico`)
    abi = { abi: [] }
  }

  return {
    address: address as Address,
    abi,
  }
}

// Configurações específicas por contrato
export const CONTRACTS = {
  TrustChain: {
    name: 'TrustChain',
    description: 'Sistema de confiança e reputação',
  },
  TradeConnect: {
    name: 'TradeConnect',
    description: 'Sistema de negociação P2P',
  },
  GovGame: {
    name: 'GovGame',
    description: 'Sistema de governança gamificada',
  },
  RewardsToken: {
    name: 'RewardsToken',
    description: 'Token de recompensas do ecossistema',
  },
  EcosystemHub: {
    name: 'EcosystemHub',
    description: 'Hub central do ecossistema',
  },
} as const

// Tipos
export type ContractName = keyof typeof CONTRACTS
export type ChainId = keyof typeof CONTRACT_ADDRESSES

// Utilitários
export function getContractAddress(
  contractName: ContractName,
  chainId?: ChainId,
): Address {
  const activeChainId = chainId || getActiveNetwork()
  const addresses =
    CONTRACT_ADDRESSES[activeChainId as keyof typeof CONTRACT_ADDRESSES]

  if (!addresses) {
    throw new Error(`Chain ID ${activeChainId} não suportado`)
  }

  const address = addresses[contractName]
  if (
    !address ||
    address === ('0x0000000000000000000000000000000000000000' as string)
  ) {
    throw new Error(
      `Contrato ${contractName} não deployado na chain ${activeChainId}`,
    )
  }

  return address as Address
}

export function getAllContracts(chainId?: ChainId) {
  const activeChainId = chainId || getActiveNetwork()
  return (
    CONTRACT_ADDRESSES[activeChainId as keyof typeof CONTRACT_ADDRESSES] || {}
  )
}

export function isContractDeployed(
  contractName: ContractName,
  chainId?: ChainId,
): boolean {
  try {
    const activeChainId = chainId || getActiveNetwork()
    const address = getContractAddress(contractName, activeChainId as ChainId)
    return address !== '0x0000000000000000000000000000000000000000'
  } catch {
    return false
  }
}

// Função para obter informações da rede ativa
export function getNetworkInfo() {
  const chainId = getActiveNetwork()
  const hasContracts = hasContractsDeployed(chainId)
  const isSupported = isSupportedNetwork(chainId)

  return {
    chainId,
    hasContracts,
    isSupported,
    networkName: getNetworkName(chainId),
    explorerUrl: getExplorerUrl(chainId),
    rpcUrl: getRpcUrl(chainId),
    nativeCurrency: getNativeCurrency(chainId),
    contracts: hasContracts ? getAllContracts(chainId as ChainId) : {},
  }
}

// Função para obter nome da rede
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

// Função para obter URL do explorer
export function getExplorerUrl(chainId: number): string {
  switch (chainId) {
    case 11155111:
      return (
        process.env.NEXT_PUBLIC_ETHEREUM_SEPOLIA_EXPLORER ||
        'https://sepolia.etherscan.io'
      )
    case 59902:
      return (
        process.env.NEXT_PUBLIC_METIS_SEPOLIA_EXPLORER ||
        'https://sepolia-explorer.metisdevops.link'
      )
    default:
      return ''
  }
}

// Função para obter URL do RPC
export function getRpcUrl(chainId: number): string {
  switch (chainId) {
    case 11155111:
      return (
        process.env.NEXT_PUBLIC_ETHEREUM_SEPOLIA_RPC ||
        'https://sepolia.infura.io/v3/YOUR_INFURA_KEY'
      )
    case 59902:
      return (
        process.env.NEXT_PUBLIC_METIS_SEPOLIA_RPC ||
        'https://sepolia.metisdevops.link'
      )
    default:
      return ''
  }
}

// Função para obter moeda nativa
export function getNativeCurrency(chainId: number): {
  name: string
  symbol: string
  decimals: number
} {
  switch (chainId) {
    case 11155111:
      return { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 }
    case 59902:
      return { name: 'Metis Token', symbol: 'METIS', decimals: 18 }
    default:
      return { name: 'Unknown', symbol: 'UNK', decimals: 18 }
  }
}

// Função para obter URL do faucet
export function getFaucetUrl(chainId: number): string {
  switch (chainId) {
    case 11155111:
      return (
        process.env.NEXT_PUBLIC_ETHEREUM_SEPOLIA_FAUCET ||
        'https://sepoliafaucet.com'
      )
    case 59902:
      return (
        process.env.NEXT_PUBLIC_METIS_SEPOLIA_FAUCET ||
        'https://sepolia.metisdevops.link/faucet'
      )
    default:
      return ''
  }
}

// Função para obter URL do explorer para endereço
export function getAddressExplorerUrl(
  address: string,
  chainId?: number,
): string {
  const activeChainId = chainId || getActiveNetwork()
  const baseUrl = getExplorerUrl(activeChainId)
  return baseUrl ? `${baseUrl}/address/${address}` : ''
}

// Função para obter URL do explorer para transação
export function getTransactionExplorerUrl(
  txHash: string,
  chainId?: number,
): string {
  const activeChainId = chainId || getActiveNetwork()
  const baseUrl = getExplorerUrl(activeChainId)
  return baseUrl ? `${baseUrl}/tx/${txHash}` : ''
}

// Função para listar todas as redes suportadas com informações
export function getAllSupportedNetworks() {
  return SUPPORTED_NETWORKS.map((chainId) => ({
    chainId,
    name: getNetworkName(chainId),
    explorerUrl: getExplorerUrl(chainId),
    rpcUrl: getRpcUrl(chainId),
    faucetUrl: getFaucetUrl(chainId),
    nativeCurrency: getNativeCurrency(chainId),
    hasContracts: hasContractsDeployed(chainId),
    contracts: getAllContracts(chainId as ChainId),
  }))
}
