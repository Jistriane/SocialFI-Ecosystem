// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import React from 'react'
import { useNetwork, useSwitchNetwork } from 'wagmi'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  getAllSupportedNetworks,
  getNetworkName,
  getActiveNetwork,
  isSupportedNetwork,
} from '@/config/contracts'
import { useTranslation } from '@/hooks/useTranslation'

interface NetworkSelectorProps {
  className?: string
}

export function NetworkSelector({ className }: NetworkSelectorProps) {
  const { t } = useTranslation('common')
  const { chain } = useNetwork()
  const { switchNetwork, isLoading } = useSwitchNetwork()

  const supportedNetworks = getAllSupportedNetworks()
  const currentChainId = chain?.id || getActiveNetwork()
  const isCurrentNetworkSupported = isSupportedNetwork(currentChainId)

  const handleNetworkSwitch = (chainId: number) => {
    if (switchNetwork) {
      switchNetwork(chainId)
    }
  }

  const getCurrentNetworkInfo = () => {
    if (!chain) {
      return {
        name: t('notConnected'),
        symbol: '?',
        unsupported: true,
      }
    }

    if (!isCurrentNetworkSupported) {
      return {
        name: t('unsupportedNetwork'),
        symbol: '⚠️',
        unsupported: true,
      }
    }

    const networkInfo = supportedNetworks.find(
      (n) => n.chainId === currentChainId,
    )
    return {
      name: networkInfo?.name || getNetworkName(currentChainId),
      symbol: networkInfo?.nativeCurrency.symbol || '?',
      unsupported: false,
    }
  }

  const currentNetwork = getCurrentNetworkInfo()

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={currentNetwork.unsupported ? 'destructive' : 'outline'}
            className="min-w-[160px] justify-between"
            disabled={isLoading}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {currentNetwork.symbol}
              </span>
              <span className="text-xs opacity-70">{currentNetwork.name}</span>
            </div>
            {isLoading && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[200px]">
          {supportedNetworks.map((network) => (
            <DropdownMenuItem
              key={network.chainId}
              onClick={() => handleNetworkSwitch(network.chainId)}
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex flex-col">
                <span className="font-medium text-sm">{network.name}</span>
                <span className="text-xs opacity-60">
                  {network.nativeCurrency.symbol} • Chain {network.chainId}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {network.hasContracts && (
                  <span
                    className="w-2 h-2 bg-green-500 rounded-full"
                    title={t('contractsDeployed')}
                  />
                )}
                {currentChainId === network.chainId && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {t('current')}
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          ))}

          {/* Informações adicionais */}
          <div className="border-t pt-2 mt-2">
            <div className="px-3 py-2 text-xs text-gray-500">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span>{t('contractsAvailable')}</span>
              </div>
              <div className="text-[10px] opacity-70">
                {t('selectNetworkToSwitch')}
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Aviso de rede não suportada */}
      {currentNetwork.unsupported && chain && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-xs text-red-700 dark:text-red-400">
            {t('unsupportedNetworkWarning')}
          </p>
        </div>
      )}
    </div>
  )
}

// Componente compacto para usar no header
export function NetworkSelectorCompact({ className }: NetworkSelectorProps) {
  const { chain } = useNetwork()
  const { switchNetwork, isLoading } = useSwitchNetwork()

  const supportedNetworks = getAllSupportedNetworks()
  const currentChainId = chain?.id || getActiveNetwork()
  const isCurrentNetworkSupported = isSupportedNetwork(currentChainId)

  const handleNetworkSwitch = (chainId: number) => {
    if (switchNetwork) {
      switchNetwork(chainId)
    }
  }

  const getCurrentNetworkSymbol = () => {
    if (!chain) return '?'
    if (!isCurrentNetworkSupported) return '⚠️'

    const networkInfo = supportedNetworks.find(
      (n) => n.chainId === currentChainId,
    )
    return networkInfo?.nativeCurrency.symbol || '?'
  }

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isCurrentNetworkSupported ? 'outline' : 'destructive'}
            size="sm"
            className="min-w-[60px]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              getCurrentNetworkSymbol()
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[180px]">
          {supportedNetworks.map((network) => (
            <DropdownMenuItem
              key={network.chainId}
              onClick={() => handleNetworkSwitch(network.chainId)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="text-sm">{network.nativeCurrency.symbol}</span>
              <span className="text-xs opacity-60">{network.name}</span>
              {currentChainId === network.chainId && (
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default NetworkSelector
