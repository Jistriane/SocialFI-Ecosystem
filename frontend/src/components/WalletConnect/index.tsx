// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useLocale } from '@/contexts/LocaleContext'
import { formatAddress, getNetworkName } from '@/config/wagmi'
import { useEffect, useState } from 'react'

export function WalletConnect() {
  const { t } = useLocale()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-10 w-36 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
    )
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted: rainbowMounted,
      }) => {
        // Simplificar a lógica de ready
        const ready = mounted && rainbowMounted

        if (!ready) {
          return (
            <div className="h-10 w-36 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
          )
        }

        if (!account) {
          return (
            <button
              onClick={openConnectModal}
              type="button"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
            >
              {t('connect_wallet') || 'Conectar Carteira'}
            </button>
          )
        }

        if (!chain) {
          return (
            <button
              onClick={openChainModal}
              type="button"
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors"
            >
              {t('wrong_network') || 'Rede Incorreta'}
            </button>
          )
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              type="button"
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors"
            >
              {t('wrong_network') || 'Rede Não Suportada'}
            </button>
          )
        }

        return (
          <div className="flex items-center gap-3">
            <button
              onClick={openChainModal}
              type="button"
              className="flex items-center gap-2 rounded-md bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-200 transition-colors"
            >
              {chain.hasIcon && chain.iconUrl && (
                <div className="h-5 w-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={chain.name ?? 'Chain icon'}
                    src={chain.iconUrl}
                    className="h-5 w-5 rounded-full"
                  />
                </div>
              )}
              {getNetworkName(chain.id) || chain.name || 'Rede'}
            </button>

            <button
              onClick={openAccountModal}
              type="button"
              className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
            >
              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {account.address ? account.address.slice(2, 4).toUpperCase() : '??'}
              </div>
              {formatAddress(account.address) || account.displayName || 'Carteira'}
            </button>
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
} 