// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

// Mock para viem
export const createPublicClient = jest.fn(() => ({
    readContract: jest.fn(),
    getBlockNumber: jest.fn(),
    getBalance: jest.fn(),
    waitForTransactionReceipt: jest.fn()
}))

export const createWalletClient = jest.fn(() => ({
    writeContract: jest.fn(),
    sendTransaction: jest.fn(),
    signMessage: jest.fn()
}))

export const http = jest.fn(() => ({}))

export const formatEther = jest.fn((value) => {
    return (Number(value) / 1e18).toFixed(6)
})

export const parseEther = jest.fn((ether) => {
    return BigInt(Math.floor(Number(ether) * 1e18))
})

export const getContract = jest.fn(() => ({
    read: {},
    write: {},
    address: '0x1234567890123456789012345678901234567890'
}))

export const encodeFunctionData = jest.fn(() => '0x')

export const decodeFunctionResult = jest.fn(() => [])

export const isAddress = jest.fn((address) => {
    return typeof address === 'string' && address.startsWith('0x') && address.length === 42
})

export const zeroAddress = '0x0000000000000000000000000000000000000000'