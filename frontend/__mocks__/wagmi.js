// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

// Mock para wagmi
export const useAccount = jest.fn(() => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
    isConnecting: false,
    isDisconnected: false
}))

export const useConnect = jest.fn(() => ({
    connect: jest.fn(),
    connectors: [],
    error: null,
    isLoading: false,
    pendingConnector: null
}))

export const useDisconnect = jest.fn(() => ({
    disconnect: jest.fn()
}))

export const useNetwork = jest.fn(() => ({
    chain: { id: 11155111, name: 'Sepolia' },
    chains: []
}))

export const useSwitchNetwork = jest.fn(() => ({
    switchNetwork: jest.fn(),
    isLoading: false,
    error: null
}))

export const useContractRead = jest.fn(() => ({
    data: null,
    isError: false,
    isLoading: false
}))

export const useContractWrite = jest.fn(() => ({
    data: null,
    isError: false,
    isLoading: false,
    write: jest.fn()
}))

export const usePrepareContractWrite = jest.fn(() => ({
    config: {},
    error: null,
    isError: false,
    isLoading: false
}))

export const useWaitForTransaction = jest.fn(() => ({
    data: null,
    isError: false,
    isLoading: false
}))

export const WagmiConfig = ({ children }) => children

export const configureChains = jest.fn(() => ({
    chains: [],
    provider: {},
    webSocketProvider: {}
}))

export const createClient = jest.fn(() => ({}))

export const sepolia = {
    id: 11155111,
    name: 'Sepolia',
    network: 'sepolia',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://sepolia.infura.io/v3/'] }
    }
}

export const mainnet = {
    id: 1,
    name: 'Ethereum',
    network: 'homestead',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://mainnet.infura.io/v3/'] }
    }
}