// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import { useCallback, useMemo, useState } from 'react'
import { usePublicClient, useWalletClient } from 'wagmi'
import {
  readContract as viemReadContract,
  writeContract as viemWriteContract,
} from 'viem/actions'
import { useToast } from '@/components/ui/use-toast'
import { useLocale } from '@/contexts/LocaleContext'
import { getContractConfig } from '@/config/contracts'

export function useContract(contractName: string) {
  const { t } = useLocale()
  const { toast } = useToast()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const [events, setEvents] = useState<any[]>([])

  const config = useMemo(() => {
    try {
      return getContractConfig(contractName)
    } catch (error) {
      console.error(
        `Erro ao obter configuração do contrato ${contractName}:`,
        error,
      )
      return null
    }
  }, [contractName])

  const handleError = useCallback(
    (error: any) => {
      console.error('Erro no contrato:', error)
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      })
    },
    [t, toast],
  )

  const readContract = useCallback(
    async (functionName: string, args: any[] = []) => {
      if (!publicClient) {
        throw new Error('Cliente público não inicializado')
      }

      if (!config?.abi?.abi) {
        throw new Error('ABI do contrato não encontrado')
      }

      // Verificar se o contrato está deployado
      if (
        !config.address ||
        config.address === '0x0000000000000000000000000000000000000000'
      ) {
        throw new Error(
          `Contrato ${contractName} não está deployado na rede atual`,
        )
      }

      try {
        console.log(`📞 Chamando ${functionName} com args:`, args)

        const result = await viemReadContract(publicClient, {
          address: config.address,
          abi: config.abi.abi,
          functionName,
          args,
        })

        console.log(`✅ Resultado de ${functionName}:`, result)
        return result
      } catch (error: any) {
        console.error(
          `❌ Erro ao ler contrato ${contractName}.${functionName}:`,
          error.message,
        )

        // Tratamento específico para diferentes tipos de erro
        if (error.message.includes('ChainDoesNotSupportContract')) {
          throw new Error(
            'Esta rede não suporta ENS. Use apenas endereços de carteira.',
          )
        }

        if (
          error.message.includes('returned no data') ||
          error.message.includes('does not exist')
        ) {
          throw new Error(
            `O contrato ${contractName} pode não estar deployado ou a função ${functionName} não existe.`,
          )
        }

        if (error.message.includes('insufficient funds')) {
          throw new Error('Saldo insuficiente para executar esta transação.')
        }

        throw error
      }
    },
    [publicClient, config, contractName],
  )

  const writeContract = useCallback(
    async (functionName: string, args: any[] = []) => {
      if (!walletClient) {
        throw new Error('Carteira não conectada')
      }

      if (!config?.abi?.abi) {
        throw new Error('ABI do contrato não encontrado')
      }

      // Verificar se o contrato está deployado
      if (
        !config.address ||
        config.address === '0x0000000000000000000000000000000000000000'
      ) {
        throw new Error(
          `Contrato ${contractName} não está deployado na rede atual`,
        )
      }

      try {
        console.log(`✍️ Escrevendo ${functionName} com args:`, args)

        const result = await viemWriteContract(walletClient, {
          address: config.address,
          abi: config.abi.abi,
          functionName,
          args,
        })

        console.log(`✅ Transação enviada:`, result)
        return result
      } catch (error: any) {
        console.error(
          `❌ Erro ao escrever contrato ${contractName}.${functionName}:`,
          error.message,
        )
        throw error
      }
    },
    [walletClient, config, contractName],
  )

  return {
    readContract,
    writeContract,
    isReady: !!config && !!publicClient,
    contractAddress: config?.address,
    events,
    handleError,
  }
}

export function useTrustChain() {
  const { readContract, writeContract } = useContract('TrustChain')

  const getProfile = useCallback(
    async (address: string) => {
      return readContract('getUserProfile', [address])
    },
    [readContract],
  )

  const createProfile = useCallback(
    async (username: string) => {
      return writeContract('createProfile', [username])
    },
    [writeContract],
  )

  const calculateScore = useCallback(
    async (address: string) => {
      return readContract('calculateScore', [address])
    },
    [readContract],
  )

  return {
    getProfile,
    createProfile,
    calculateScore,
  }
}

export function useTradeConnect() {
  const { readContract, writeContract } = useContract('TradeConnect')

  const getTrades = useCallback(async () => {
    return readContract('getTrades')
  }, [readContract])

  const createTrade = useCallback(
    async (params: any) => {
      return writeContract('createTrade', [params])
    },
    [writeContract],
  )

  return {
    getTrades,
    createTrade,
  }
}

export function useGovGame() {
  const { readContract, writeContract } = useContract('GovGame')

  const getProposals = useCallback(async () => {
    return readContract('getProposals')
  }, [readContract])

  const createProposal = useCallback(
    async (params: any) => {
      return writeContract('createProposal', [params])
    },
    [writeContract],
  )

  const vote = useCallback(
    async (proposalId: number, support: boolean) => {
      return writeContract('vote', [proposalId, support])
    },
    [writeContract],
  )

  return {
    getProposals,
    createProposal,
    vote,
  }
}
