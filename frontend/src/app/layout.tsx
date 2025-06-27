// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { Metadata } from 'next'
import { Providers } from './providers'
import { LocaleProvider } from '@/contexts/LocaleContext'
import { ContractEventsProvider } from '@/components/ContractEventsProvider'
import { Header } from '@/components/Header'
import { Toaster } from '@/components/ui/toaster'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'SocialFI Ecosystem',
  description: 'A decentralized social finance ecosystem',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>
          <LocaleProvider>
            <ContractEventsProvider>
              <Header />
              <main className="min-h-screen">
                {children}
              </main>
              <Toaster />
            </ContractEventsProvider>
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  )
} 