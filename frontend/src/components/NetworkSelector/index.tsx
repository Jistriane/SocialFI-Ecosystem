// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

export interface NetworkConfig {
  id: number
  name: string
  symbol: string
  rpcUrl: string
  explorerUrl: string
  hasContracts: boolean
  contractsInfo?: string
}

const AVAILABLE_NETWORKS: NetworkConfig[] = [
  {
    id: 11155111,
    name: 'Ethereum Sepolia',
    symbol: 'ETH',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/61Zd4evHrQL88jxDE0WWi',
    explorerUrl: 'https://sepolia.etherscan.io',
    hasContracts: true,
    contractsInfo: 'Contratos deployados e funcionais',
  },
  {
    id: 59902,
    name: 'Metis Sepolia',
    symbol: 'tMETIS',
    rpcUrl: 'https://sepolia.metisdevops.link',
    explorerUrl: 'https://sepolia-explorer.metisdevops.link',
    hasContracts: true,
    contractsInfo: 'Contratos deployados e funcionais',
  },
]

interface NetworkSelectorProps {
  selectedNetwork: NetworkConfig | null
  onNetworkSelect: (network: NetworkConfig) => void
  onConnect: () => void
  isConnecting?: boolean
}

export default function NetworkSelector({
  selectedNetwork,
  onNetworkSelect,
  onConnect,
  isConnecting = false,
}: NetworkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleNetworkSelect = (network: NetworkConfig) => {
    onNetworkSelect(network)
    setIsOpen(false)
  }

  return (
    <div className="flex flex-col gap-4 p-6 bg-white rounded-lg border border-gray-200 shadow-lg max-w-md mx-auto">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Selecione a Rede
        </h3>
        <p className="text-sm text-gray-600">
          Escolha a rede blockchain antes de conectar sua carteira
        </p>
      </div>

      <div className="space-y-3">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between h-auto py-3 px-4"
            >
              {selectedNetwork ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedNetwork.hasContracts ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div className="text-left">
                      <div className="font-medium">{selectedNetwork.name}</div>
                      <div className="text-xs text-gray-500">{selectedNetwork.symbol}</div>
                    </div>
                  </div>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="text-gray-500">Selecione uma rede...</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-full min-w-[300px]">
            {AVAILABLE_NETWORKS.map((network) => (
              <DropdownMenuItem
                key={network.id}
                onClick={() => handleNetworkSelect(network)}
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    network.hasContracts ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <div className="font-medium">{network.name}</div>
                    <div className="text-xs text-gray-500">{network.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    network.hasContracts 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {network.hasContracts ? '✓ Ativo' : '⚠ Pendente'}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {selectedNetwork && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${
                selectedNetwork.hasContracts ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm font-medium">Status dos Contratos</span>
            </div>
            <p className="text-xs text-gray-600">{selectedNetwork.contractsInfo}</p>
            
            {!selectedNetwork.hasContracts && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                ⚠️ Esta rede ainda não possui contratos deployados. Você pode conectar, mas as funcionalidades estarão limitadas.
              </div>
            )}
          </div>
        )}

        <Button 
          onClick={onConnect}
          disabled={!selectedNetwork || isConnecting}
          className="w-full py-3"
          size="lg"
        >
          {isConnecting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Conectando...
            </div>
          ) : selectedNetwork ? (
            `Conectar à ${selectedNetwork.name}`
          ) : (
            'Selecione uma rede primeiro'
          )}
        </Button>
      </div>

      {selectedNetwork && (
        <div className="text-center">
          <a 
            href={selectedNetwork.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Ver Explorer da {selectedNetwork.name} ↗
          </a>
        </div>
      )}
    </div>
  )
}

export { AVAILABLE_NETWORKS }
