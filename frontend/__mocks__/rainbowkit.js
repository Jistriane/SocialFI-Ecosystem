// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

// Mock para @rainbow-me/rainbowkit
export const RainbowKitProvider = ({ children }) => children

export const ConnectButton = () => ( <
    button data - testid = "connect-button" > Connect Wallet < /button>
)

export const getDefaultWallets = jest.fn(() => ({
    connectors: [],
    wallets: []
}))

export const connectorsForWallets = jest.fn(() => [])

export const injectedWallet = jest.fn(() => ({}))
export const metaMaskWallet = jest.fn(() => ({}))
export const walletConnectWallet = jest.fn(() => ({}))

export const lightTheme = jest.fn(() => ({}))
export const darkTheme = jest.fn(() => ({}))

export const midnightTheme = jest.fn(() => ({}))