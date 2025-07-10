// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useChainId } from 'wagmi'
import { NetworkSelector } from '../NetworkSelector'
import { WalletConnect } from './index'
import { useLocale } from '@/contexts/LocaleContext'
import {
  getAllSupportedNetworks,
  getNetworkName,
  isSupportedNetwork,
  hasContractsDeployed,
} from '@/config/contracts'

interface NetworkConfig {
  chainId: number
  name: string
  nativeCurrency: { symbol: string }
  hasContracts: boolean
  explorerUrl: string
  rpcUrl: string
  faucetUrl: string
}

export function WalletConnectWithNetwork() {
  const { t } = useLocale()
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkConfig | null>(
    null,
  )
  const [showNetworkSelector, setShowNetworkSelector] = useState(true)
  const chainId = useChainId()

  // Obter redes suportadas
  const supportedNetworks = getAllSupportedNetworks()

  // Define rede padrão (primeira rede com contratos)
  useEffect(() => {
    const defaultNetwork = supportedNetworks.find((n) => n.hasContracts)
    if (defaultNetwork && !selectedNetwork) {
      setSelectedNetwork(defaultNetwork)
    }
  }, [selectedNetwork, supportedNetworks])

  // Verifica se a carteira já está conectada
  useEffect(() => {
    if (chainId) {
      setShowNetworkSelector(false)
    }
  }, [chainId])

  const handleDisconnect = () => {
    setShowNetworkSelector(true)
    setSelectedNetwork(supportedNetworks.find((n) => n.hasContracts) || null)
  }

  // Se a carteira está conectada, mostra o componente normal
  if (!showNetworkSelector) {
    return (
      <div className="flex flex-col gap-4">
        <WalletConnect />
        <div className="text-center">
          <button
            onClick={handleDisconnect}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Trocar rede
          </button>
        </div>

        {/* Aviso sobre rede atual */}
        {chainId && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
            {isSupportedNetwork(chainId) && hasContractsDeployed(chainId) ? (
              <div className="text-green-700">
                ✅ <strong>{getNetworkName(chainId)}</strong> - Todos os
                contratos disponíveis
              </div>
            ) : isSupportedNetwork(chainId) ? (
              <div className="text-yellow-700">
                ⚠️ <strong>{getNetworkName(chainId)}</strong> - Contratos não
                deployados
              </div>
            ) : (
              <div className="text-red-700">
                ❌ <strong>Rede não suportada</strong> - Troque para uma rede
                suportada
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Se não está conectada, mostra o seletor de rede
  return (
    <div className="flex flex-col items-center gap-6">
      <NetworkSelector className="w-full max-w-md" />

      {selectedNetwork && (
        <div className="w-full max-w-md">
          <ConnectButton.Custom>
            {({ openConnectModal, account }) => {
              if (account) {
                setShowNetworkSelector(false)
                return null
              }

              return (
                <button
                  onClick={openConnectModal}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {t('connect_wallet')} - {selectedNetwork.name}
                </button>
              )
            }}
          </ConnectButton.Custom>
        </div>
      )}

      {selectedNetwork && !selectedNetwork.hasContracts && (
        <div className="max-w-md p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <div className="font-medium mb-2">⚠️ Aviso sobre a rede selecionada</div>
          <p>
            A rede <strong>{selectedNetwork.name}</strong> ainda não possui
            contratos deployados. Você pode conectar sua carteira, mas as
            funcionalidades do sistema estarão limitadas.
          </p>
          <p className="mt-2 text-xs">
            Recomendamos usar uma rede com contratos deployados para ter acesso
            completo ao ecossistema.
          </p>
        </div>
      )}
    </div>
  )
}

export default WalletConnectWithNetwork
