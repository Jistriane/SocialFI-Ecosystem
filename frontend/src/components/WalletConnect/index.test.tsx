// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { render, screen, fireEvent } from '@testing-library/react'
import { WalletConnect } from './index'
import { LocaleProvider } from '@/contexts/LocaleContext'

// Mock do RainbowKit
jest.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: {
    Custom: ({ children }: any) => {
      return children({
        account: {
          address: '0x1234567890123456789012345678901234567890',
          ensAvatar: null,
        },
        chain: {
          hasIcon: true,
          iconUrl: 'https://example.com/icon.png',
          name: 'Sepolia',
          id: 11155111,
          unsupported: false,
        },
        openAccountModal: jest.fn(),
        openChainModal: jest.fn(),
        openConnectModal: jest.fn(),
        authenticationStatus: 'authenticated',
        mounted: true,
      })
    },
  },
}))

describe('WalletConnect', () => {
  it('deve renderizar o botão de conectar carteira quando não estiver conectado', () => {
    render(
      <LocaleProvider>
        <WalletConnect />
      </LocaleProvider>,
    )

    expect(screen.getByText('connect_wallet')).toBeInTheDocument()
  })

  it('deve renderizar o endereço da carteira quando conectado', () => {
    render(
      <LocaleProvider>
        <WalletConnect />
      </LocaleProvider>,
    )

    expect(screen.getByText('0x1234...7890')).toBeInTheDocument()
  })

  it('deve renderizar o nome da rede quando conectado', () => {
    render(
      <LocaleProvider>
        <WalletConnect />
      </LocaleProvider>,
    )

    expect(screen.getByText('Sepolia Testnet')).toBeInTheDocument()
  })

  it('deve chamar openConnectModal ao clicar no botão de conectar', () => {
    const openConnectModal = jest.fn()
    jest.mock('@rainbow-me/rainbowkit', () => ({
      ConnectButton: {
        Custom: ({ children }: any) => {
          return children({
            account: null,
            chain: null,
            openAccountModal: jest.fn(),
            openChainModal: jest.fn(),
            openConnectModal,
            authenticationStatus: 'authenticated',
            mounted: true,
          })
        },
      },
    }))

    render(
      <LocaleProvider>
        <WalletConnect />
      </LocaleProvider>,
    )

    fireEvent.click(screen.getByText('connect_wallet'))
    expect(openConnectModal).toHaveBeenCalled()
  })

  it('deve chamar openChainModal ao clicar no botão de rede', () => {
    const openChainModal = jest.fn()
    jest.mock('@rainbow-me/rainbowkit', () => ({
      ConnectButton: {
        Custom: ({ children }: any) => {
          return children({
            account: {
              address: '0x1234567890123456789012345678901234567890',
              ensAvatar: null,
            },
            chain: {
              hasIcon: true,
              iconUrl: 'https://example.com/icon.png',
              name: 'Sepolia',
              id: 11155111,
              unsupported: false,
            },
            openAccountModal: jest.fn(),
            openChainModal,
            openConnectModal: jest.fn(),
            authenticationStatus: 'authenticated',
            mounted: true,
          })
        },
      },
    }))

    render(
      <LocaleProvider>
        <WalletConnect />
      </LocaleProvider>,
    )

    fireEvent.click(screen.getByText('Sepolia Testnet'))
    expect(openChainModal).toHaveBeenCalled()
  })

  it('deve chamar openAccountModal ao clicar no botão de conta', () => {
    const openAccountModal = jest.fn()
    jest.mock('@rainbow-me/rainbowkit', () => ({
      ConnectButton: {
        Custom: ({ children }: any) => {
          return children({
            account: {
              address: '0x1234567890123456789012345678901234567890',
              ensAvatar: null,
            },
            chain: {
              hasIcon: true,
              iconUrl: 'https://example.com/icon.png',
              name: 'Sepolia',
              id: 11155111,
              unsupported: false,
            },
            openAccountModal,
            openChainModal: jest.fn(),
            openConnectModal: jest.fn(),
            authenticationStatus: 'authenticated',
            mounted: true,
          })
        },
      },
    }))

    render(
      <LocaleProvider>
        <WalletConnect />
      </LocaleProvider>,
    )

    fireEvent.click(screen.getByText('0x1234...7890'))
    expect(openAccountModal).toHaveBeenCalled()
  })
})
