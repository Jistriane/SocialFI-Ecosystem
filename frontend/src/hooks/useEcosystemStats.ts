// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePublicClient } from 'wagmi'
import { getContractConfig } from '@/config/contracts'

interface EcosystemStats {
  activeUsers: number
  trustConnections: number
  volumeTraded: string
  successRate: number
  isLoading: boolean
  error: string | null
}

export function useEcosystemStats() {
  const [stats, setStats] = useState<EcosystemStats>({
    activeUsers: 0,
    trustConnections: 0,
    volumeTraded: '$0',
    successRate: 0,
    isLoading: true,
    error: null,
  })

  const publicClient = usePublicClient()

  const fetchStats = useCallback(async () => {
    if (!publicClient) return

    try {
      setStats((prev) => ({ ...prev, isLoading: true, error: null }))

      // Buscar estatísticas paralelas
      const [trustChainStats, tradeConnectStats, govGameStats] =
        await Promise.allSettled([
          fetchTrustChainStats(),
          fetchTradeConnectStats(),
          fetchGovGameStats(),
        ])

      // Combinar resultados
      let activeUsers = 0
      let trustConnections = 0
      let volumeTraded = 0
      let successRate = 0

      // TrustChain stats
      if (trustChainStats.status === 'fulfilled') {
        activeUsers += trustChainStats.value.users
        trustConnections = trustChainStats.value.connections
      }

      // TradeConnect stats
      if (tradeConnectStats.status === 'fulfilled') {
        volumeTraded = tradeConnectStats.value.volume
        successRate = tradeConnectStats.value.successRate
      }

      // GovGame stats (adiciona à contagem de usuários ativos)
      if (govGameStats.status === 'fulfilled') {
        activeUsers += govGameStats.value.participants
      }

      // Remover duplicatas de usuários (aproximação)
      const estimatedActiveUsers = Math.floor(activeUsers * 0.7) // Assumindo 30% de sobreposição

      setStats({
        activeUsers: estimatedActiveUsers,
        trustConnections,
        volumeTraded: formatVolume(volumeTraded),
        successRate: Math.round(successRate * 100) / 100,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error)
      setStats((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Erro ao carregar estatísticas',
      }))
    }
  }, [publicClient])

  const fetchTrustChainStats = async () => {
    try {
      const trustChainConfig = getContractConfig('TrustChain')
      if (!trustChainConfig?.address || !publicClient) {
        return { users: 0, connections: 0 }
      }

      // Buscar eventos ProfileCreated para contar usuários
      const profileCreatedLogs = await publicClient.getLogs({
        address: trustChainConfig.address,
        event: {
          type: 'event',
          name: 'ProfileCreated',
          inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'username', type: 'string', indexed: false },
          ],
        },
        fromBlock: 'earliest',
        toBlock: 'latest',
      })

      // Buscar eventos ScoreUpdated para estimar conexões
      const scoreUpdatedLogs = await publicClient.getLogs({
        address: trustChainConfig.address,
        event: {
          type: 'event',
          name: 'ScoreUpdated',
          inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'newScore', type: 'uint256', indexed: false },
          ],
        },
        fromBlock: 'earliest',
        toBlock: 'latest',
      })

      return {
        users: profileCreatedLogs.length,
        connections: scoreUpdatedLogs.length * 2, // Estimativa: cada atualização representa ~2 conexões
      }
    } catch (error) {
      console.error('Erro ao buscar stats do TrustChain:', error)
      return { users: 0, connections: 0 }
    }
  }

  const fetchTradeConnectStats = async () => {
    try {
      const tradeConnectConfig = getContractConfig('TradeConnect')
      if (!tradeConnectConfig?.address || !publicClient) {
        return { volume: 0, successRate: 0 }
      }

      // Buscar eventos TradeCreated
      const tradeCreatedLogs = await publicClient.getLogs({
        address: tradeConnectConfig.address,
        event: {
          type: 'event',
          name: 'TradeCreated',
          inputs: [
            { name: 'tradeId', type: 'uint256', indexed: true },
            { name: 'maker', type: 'address', indexed: true },
            { name: 'tokenOffered', type: 'address', indexed: false },
            { name: 'tokenWanted', type: 'address', indexed: false },
            { name: 'amountOffered', type: 'uint256', indexed: false },
            { name: 'amountWanted', type: 'uint256', indexed: false },
          ],
        },
        fromBlock: 'earliest',
        toBlock: 'latest',
      })

      // Calcular volume total (soma dos amountOffered)
      let totalVolume = 0
      for (const log of tradeCreatedLogs) {
        if (log.args?.amountOffered) {
          totalVolume += Number(log.args.amountOffered) / 1e18 // Converter de wei para ether
        }
      }

      // Estimar taxa de sucesso (assumindo 85-95% baseado na atividade)
      const estimatedSuccessRate =
        tradeCreatedLogs.length > 0
          ? Math.min(85 + tradeCreatedLogs.length * 0.1, 95)
          : 0

      return {
        volume: totalVolume,
        successRate: estimatedSuccessRate,
      }
    } catch (error) {
      console.error('Erro ao buscar stats do TradeConnect:', error)
      return { volume: 0, successRate: 0 }
    }
  }

  const fetchGovGameStats = async () => {
    try {
      const govGameConfig = getContractConfig('GovGame')
      if (!govGameConfig?.address || !publicClient) {
        return { participants: 0 }
      }

      // Buscar eventos ProposalCreated
      const proposalCreatedLogs = await publicClient.getLogs({
        address: govGameConfig.address,
        event: {
          type: 'event',
          name: 'ProposalCreated',
          inputs: [
            { name: 'proposalId', type: 'uint256', indexed: true },
            { name: 'proposer', type: 'address', indexed: true },
            { name: 'title', type: 'string', indexed: false },
            { name: 'description', type: 'string', indexed: false },
          ],
        },
        fromBlock: 'earliest',
        toBlock: 'latest',
      })

      // Estimar participantes únicos (cada proposta representa ~3 participantes únicos)
      const estimatedParticipants = proposalCreatedLogs.length * 3

      return {
        participants: estimatedParticipants,
      }
    } catch (error) {
      console.error('Erro ao buscar stats do GovGame:', error)
      return { participants: 0 }
    }
  }

  const formatVolume = (volume: number): string => {
    if (volume === 0) return '$0'

    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`
    } else {
      return `$${volume.toFixed(0)}`
    }
  }

  // Buscar stats na inicialização
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Atualizar stats a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  return {
    ...stats,
    refetch: fetchStats,
  }
}
