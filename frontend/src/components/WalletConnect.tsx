// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import { useEffect, useState } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsName,
  useNetwork,
} from 'wagmi'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useLocale } from '@/contexts/LocaleContext'
import { useAppStore } from '@/stores/useAppStore'
import { Loader2 } from 'lucide-react'

export function WalletConnect() {
  const { t } = useLocale()
  const { toast } = useToast()
  const { setWalletConnected, setAddress } = useAppStore()
  const [mounted, setMounted] = useState(false)

  const { address, isConnecting } = useAccount({
    onConnect({ address }) {
      setWalletConnected(true)
      setAddress(address || null)
      toast({
        title: t('success'),
        description: t('connected'),
      })
    },
    onDisconnect() {
      setWalletConnected(false)
      setAddress(null)
    },
  })

  const { chain } = useNetwork()

  // Desabilitar ENS na Metis Sepolia (chain ID 59902) pois não suporta
  const shouldUseEns = chain?.id !== 59902
  const { data: ensName } = useEnsName({
    address,
    enabled: shouldUseEns && !!address,
  })

  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error.message,
      })
    }
  }, [error, t, toast])

  // Evita hidratação mismatch - sempre mostra loading até montar
  if (!mounted || isConnecting) {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t('loading')}
      </Button>
    )
  }

  if (address) {
    return (
      <Button variant="outline" onClick={() => disconnect()}>
        {ensName ?? `${address.slice(0, 6)}...${address.slice(-4)}`}
      </Button>
    )
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <Button
          disabled={!connector.ready || isLoading}
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          {isLoading && connector.id === pendingConnector?.id && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {t('connect_wallet')}
        </Button>
      ))}
    </div>
  )
}
