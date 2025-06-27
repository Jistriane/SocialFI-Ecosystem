// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

// Metadata removed - using client component
import { ContractTest } from '@/components/ContractTest'
import WalletConnectWithNetwork from '@/components/WalletConnect/WalletConnectWithNetwork'
import { useLocale } from '@/contexts/LocaleContext'
import { useEcosystemStats } from '@/hooks/useEcosystemStats'
import {
  Shield,
  TrendingUp,
  Vote,
  Link,
  ShieldCheck,
  Gamepad2,
  Loader2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { t } = useLocale()
  const router = useRouter()
  const { activeUsers, trustConnections, volumeTraded, successRate, isLoading, error } = useEcosystemStats()

  // Função para navegar para páginas específicas
  const handleFeatureClick = (feature: string) => {
    switch (feature) {
      case 'multichain':
        // Rolar para a seção de conexão de carteira
        document
          .getElementById('wallet-section')
          ?.scrollIntoView({ behavior: 'smooth' })
        break
      case 'decentralized':
        router.push('/trustchain')
        break
      case 'gamified':
        router.push('/govgame')
        break
      default:
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto p-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero Section */}
          <section className="text-center space-y-6 py-12">
            <div className="relative">
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-metis-400 via-white to-hyperion-400 bg-clip-text text-transparent animate-float">
                {t('home.title')}
              </h1>
              <div className="absolute inset-0 bg-gradient-to-r from-metis-500/20 to-hyperion-500/20 blur-3xl -z-10 animate-pulse"></div>
            </div>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button
                onClick={() => handleFeatureClick('multichain')}
                className="group px-4 py-2 bg-gradient-to-r from-metis-500/20 to-hyperion-500/20 border border-metis-500/30 rounded-full text-metis-300 text-sm font-medium hover:from-metis-500/30 hover:to-hyperion-500/30 hover:border-metis-500/50 transition-all duration-300 cursor-pointer flex items-center gap-2"
              >
                <Link className="w-4 h-4 group-hover:scale-110 transition-transform" />
                🔗 {t('home.features.multichain') || 'Multi-Chain'}
              </button>
              <button
                onClick={() => handleFeatureClick('decentralized')}
                className="group px-4 py-2 bg-gradient-to-r from-hyperion-500/20 to-metis-500/20 border border-hyperion-500/30 rounded-full text-hyperion-300 text-sm font-medium hover:from-hyperion-500/30 hover:to-metis-500/30 hover:border-hyperion-500/50 transition-all duration-300 cursor-pointer flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                🛡️ {t('home.features.decentralized') || 'Descentralizado'}
              </button>
              <button
                onClick={() => handleFeatureClick('gamified')}
                className="group px-4 py-2 bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon-purple/30 rounded-full text-neon-purple text-sm font-medium hover:from-neon-purple/30 hover:to-neon-blue/30 hover:border-neon-purple/50 transition-all duration-300 cursor-pointer flex items-center gap-2"
              >
                <Gamepad2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                🎮 {t('home.features.gamified') || 'Gamificado'}
              </button>
            </div>
          </section>

          {/* Features Grid */}
          <section className="grid md:grid-cols-3 gap-8 mt-16">
            {/* TrustChain */}
            <div
              className="group cursor-pointer"
              onClick={() => router.push('/trustchain')}
            >
              <div className="metis-card p-8 space-y-4 hover:scale-105 transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-metis-500/10 to-transparent rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-metis-500 to-metis-600 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-glow">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {t('home.trustchain.title')}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {t('home.trustchain.description')}
                  </p>
                  <div className="mt-6 flex items-center text-metis-400 text-sm font-medium">
                    <span>{t('home.trustchain.explore')}</span>
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TradeConnect */}
            <div
              className="group cursor-pointer"
              onClick={() => router.push('/tradeconnect')}
            >
              <div className="metis-card p-8 space-y-4 hover:scale-105 transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-hyperion-500/10 to-transparent rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-hyperion-500 to-hyperion-600 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-glow">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {t('home.tradeconnect.title')}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {t('home.tradeconnect.description')}
                  </p>
                  <div className="mt-6 flex items-center text-hyperion-400 text-sm font-medium">
                    <span>{t('home.tradeconnect.explore')}</span>
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* GovGame */}
            <div
              className="group cursor-pointer"
              onClick={() => router.push('/govgame')}
            >
              <div className="metis-card p-8 space-y-4 hover:scale-105 transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-neon-purple/10 to-transparent rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-neon-purple to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-glow">
                    <Vote className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {t('home.govgame.title')}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {t('home.govgame.description')}
                  </p>
                  <div className="mt-6 flex items-center text-neon-purple text-sm font-medium">
                    <span>{t('home.govgame.explore')}</span>
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="grid md:grid-cols-4 gap-6 mt-16">
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-metis-400 flex items-center justify-center gap-2">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : error ? (
                  '---'
                ) : (
                  activeUsers.toLocaleString()
                )}
              </div>
              <div className="text-slate-400 text-sm">
                {t('home.stats.active_users')}
              </div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-hyperion-400 flex items-center justify-center gap-2">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : error ? (
                  '---'
                ) : (
                  trustConnections.toLocaleString()
                )}
              </div>
              <div className="text-slate-400 text-sm">
                {t('home.stats.trust_connections')}
              </div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-neon-green flex items-center justify-center gap-2">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : error ? (
                  '---'
                ) : (
                  volumeTraded
                )}
              </div>
              <div className="text-slate-400 text-sm">
                {t('home.stats.volume_traded')}
              </div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-neon-yellow flex items-center justify-center gap-2">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : error ? (
                  '---'
                ) : (
                  `${successRate}%`
                )}
              </div>
              <div className="text-slate-400 text-sm">
                {t('home.stats.success_rate')}
              </div>
            </div>
          </section>

          {/* Wallet Connection Section */}
                    <section id="wallet-section" className="mt-16 space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                {t('home.sections.connect_wallet')}
              </h2>
              <p className="text-slate-400">
                {t('home.sections.connect_wallet_desc')}
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <WalletConnectWithNetwork />
            </div>
          </section>

          {/* Integration Test Section */}
          <section className="mt-16 space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                {t('home.sections.integration_test')}
              </h2>
              <p className="text-slate-400">
                {t('home.sections.integration_test_desc')}
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="metis-card p-1">
                <div className="bg-slate-900/50 rounded-lg p-6">
                  <ContractTest />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
        </div>
  )
} 