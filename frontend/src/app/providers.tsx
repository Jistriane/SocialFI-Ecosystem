// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { WagmiConfig } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config, chains } from '../config/wagmi'
import { useState, useEffect } from 'react'
import { ContractEventsProvider } from '@/components/ContractEventsProvider'
import { LocaleProvider } from '@/contexts/LocaleContext'
import { Toaster } from '@/components/ui/toaster'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Componente para evitar problemas de hidratação
function NoSSR({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Carregando...</div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NoSSR>
      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={config}>
          <RainbowKitProvider
            chains={chains}
            modalSize="compact"
            theme={darkTheme({
              accentColor: '#00D4AA',
              accentColorForeground: 'white',
              borderRadius: 'medium',
              fontStack: 'system',
            })}
            showRecentTransactions={true}
            appInfo={{
              appName: 'SocialFI Ecosystem',
              learnMoreUrl: 'https://metis.io',
            }}
          >
            <LocaleProvider>
              <ContractEventsProvider>
                {children}
                <Toaster />
              </ContractEventsProvider>
            </LocaleProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </QueryClientProvider>
    </NoSSR>
  )
} 