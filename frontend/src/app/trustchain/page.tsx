// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { Metadata } from 'next'
import TrustChainClient from './TrustChainClient'

export const metadata: Metadata = {
  title: 'TrustChain - SocialFI Ecosystem',
  description: 'Sistema de reputação descentralizado baseado em conexões de confiança',
}

export default function TrustChainPage() {
  return <TrustChainClient />
}
