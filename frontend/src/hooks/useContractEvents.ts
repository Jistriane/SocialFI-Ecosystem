// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
import { getContractConfig } from '@/config/contracts'
import { Address } from 'viem'

interface EventFilter {
  eventName: string
  fromBlock?: bigint
  toBlock?: bigint
}

export function useContractEvents(contractName: string, filter: EventFilter) {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const publicClient = usePublicClient()
  const config = getContractConfig(contractName)

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const logs = await publicClient.getLogs({
          address: config.address as Address,
          event: config.abi.find((item: any) => item.name === filter.eventName && item.type === 'event'),
          fromBlock: filter.fromBlock,
          toBlock: filter.toBlock,
        })

        setEvents(logs)
      } catch (err) {
        console.error('Erro ao buscar eventos:', err)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [publicClient, config, filter])

  const subscribeToEvents = async (callback: (event: any) => void) => {
    try {
      const unwatch = await publicClient.watchContractEvent({
        address: config.address as Address,
        abi: config.abi,
        eventName: filter.eventName,
        onLogs: callback,
      })

      return unwatch
    } catch (err) {
      console.error('Erro ao assinar eventos:', err)
      throw err
    }
  }

  return {
    events,
    isLoading,
    error,
    subscribeToEvents,
  }
} 