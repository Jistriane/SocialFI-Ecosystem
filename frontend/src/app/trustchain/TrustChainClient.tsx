// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import { useState, useEffect } from 'react'
import { TrustChainProfile } from '@/components/TrustChainProfile'
import {
  Shield,
  Users,
  Star,
  Activity,
  Award,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  X,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/contexts/LocaleContext'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useTrustChain } from '@/hooks/useContract'
import { useToast } from '@/components/ui/use-toast'

interface TrustChainStats {
  totalUsers: number
  totalConnections: number
  trustRate: number
  totalTransactions: number
}

interface UserProfile {
  exists: boolean
  username: string
  trustScore: number
  connectionsCount: number
  transactionsCount: number
  reputation: string
  joinDate: number
}

export default function TrustChainClient() {
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useState('overview')
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<TrustChainStats | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const { address, isConnected } = useAccount()
  const { getProfile, calculateScore, createProfile } = useTrustChain()
  const { toast } = useToast()

  // Carregar estatísticas gerais do TrustChain
  useEffect(() => {
    const loadStats = async () => {
      if (!isConnected) return

      try {
        setLoading(true)
        // Buscar dados reais do contrato
        // Aqui você implementaria as funções específicas do seu contrato
        const statsData: TrustChainStats = {
          totalUsers: 0,
          totalConnections: 0,
          trustRate: 0,
          totalTransactions: 0,
        }
        setStats(statsData)
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
        toast({
          title: 'Erro',
          description:
            'Não foi possível carregar as estatísticas do TrustChain',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [isConnected, toast])

  // Carregar perfil do usuário
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!address || !isConnected) return

      try {
        setLoading(true)
        const profile = await getProfile(address)
        const score = await calculateScore(address)

        if (
          profile &&
          typeof profile === 'object' &&
          !Array.isArray(profile) &&
          (profile as any).exists
        ) {
          setUserProfile({
            exists: true,
            username: (profile as any).username || '',
            trustScore: Number(score) || 0,
            connectionsCount: Number((profile as any).connectionsCount) || 0,
            transactionsCount: Number((profile as any).transactionsCount) || 0,
            reputation: getReputationLevel(Number(score) || 0),
            joinDate: Number((profile as any).createdAt) || Date.now(),
          })
        } else {
          setUserProfile({
            exists: false,
            username: '',
            trustScore: 0,
            connectionsCount: 0,
            transactionsCount: 0,
            reputation: 'Novo',
            joinDate: Date.now(),
          })
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        setUserProfile({
          exists: false,
          username: '',
          trustScore: 0,
          connectionsCount: 0,
          transactionsCount: 0,
          reputation: 'Novo',
          joinDate: Date.now(),
        })
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [address, isConnected, getProfile, calculateScore])

  const getReputationLevel = (score: number): string => {
    if (score >= 900) return 'Master'
    if (score >= 700) return 'Expert'
    if (score >= 500) return 'Confiável'
    if (score >= 300) return 'Intermediário'
    if (score >= 100) return 'Iniciante'
    return 'Novo'
  }

  const handleCreateProfile = async (username: string) => {
    if (!address || !isConnected) return

    try {
      setLoading(true)
      await createProfile(username)
      toast({
        title: 'Sucesso!',
        description: 'Perfil criado com sucesso!',
      })
      // Recarregar perfil após criação
      window.location.reload()
    } catch (error) {
      console.error('Erro ao criar perfil:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o perfil. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: Shield },
    { id: 'connections', name: 'Conexões', icon: Users },
    { id: 'reputation', name: 'Reputação', icon: Star },
    { id: 'activity', name: 'Atividade', icon: Activity },
  ]

  // Modal "Saiba Mais"
  const LearnMoreModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Sobre o TrustChain
            </h2>
            <button
              onClick={() => setShowLearnMoreModal(false)}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Fechar modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6 text-slate-300">
            <section>
              <h3 className="text-xl font-semibold text-white mb-3">
                O que é o TrustChain?
              </h3>
              <p>
                O TrustChain é um sistema revolucionário de reputação
                descentralizado que utiliza a tecnologia blockchain para criar
                uma rede de confiança transparente e verificável. Cada
                interação, conexão e transação é registrada de forma imutável,
                construindo um perfil de confiança único para cada usuário.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3">
                Como Funciona?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-metis-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      Criação de Perfil
                    </h4>
                    <p>
                      Conecte sua carteira e crie seu perfil TrustChain único na
                      blockchain.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-hyperion-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      Estabeleça Conexões
                    </h4>
                    <p>
                      Conecte-se com outros usuários através de transações,
                      colaborações ou validações mútuas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-neon-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      Construa Reputação
                    </h4>
                    <p>
                      Sua pontuação de confiança cresce automaticamente com cada
                      interação bem-sucedida.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3">
                Benefícios
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                  <span>Transparência total das interações</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                  <span>Imutabilidade dos registros na blockchain</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                  <span>Redução de riscos em transações DeFi</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                  <span>Acesso a oportunidades exclusivas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                  <span>Recompensas por alta reputação</span>
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3">
                Tecnologia
              </h3>
              <p>
                Construído na blockchain Metis Hyperion, o TrustChain utiliza
                contratos inteligentes avançados para garantir a segurança e
                eficiência das operações. A integração com o ecossistema
                SocialFI permite uma experiência fluida entre diferentes
                aplicações descentralizadas.
              </p>
            </section>

            <div className="flex justify-center pt-4">
              <a
                href="https://metis.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-metis-400 hover:text-metis-300 transition-colors"
              >
                <span>Saiba mais sobre Metis</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-6 py-12">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-metis-500 to-metis-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-metis-500/20 to-hyperion-500/20 blur-3xl -z-10 animate-pulse"></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gradient-metis">
              TrustChain
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Sistema de reputação descentralizado que constrói confiança
              através de conexões verificadas e validadas na blockchain.
            </p>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Conecte sua Carteira
              </h3>
              <p className="text-slate-300 mb-4">
                Para acessar o TrustChain, você precisa conectar sua carteira
                primeiro.
              </p>
              <ConnectButton.Custom>
                {({ account, chain, openConnectModal, mounted }) => {
                  return (
                    <Button
                      onClick={openConnectModal}
                      className="bg-metis-600 hover:bg-metis-700 text-white px-8 py-3"
                    >
                      Conectar Carteira
                    </Button>
                  )
                }}
              </ConnectButton.Custom>
            </div>
          )}

          {isConnected && (
            <>
              {/* Stats Cards - Dados Reais */}
              <div className="grid md:grid-cols-4 gap-6">
                <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-metis-500 to-metis-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:animate-glow">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-metis-400">
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                      stats?.totalUsers || 0
                    )}
                  </div>
                  <div className="text-slate-400 text-sm">
                    Usuários Verificados
                  </div>
                </div>

                <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-hyperion-500 to-hyperion-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:animate-glow">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-hyperion-400">
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                      stats?.totalConnections || 0
                    )}
                  </div>
                  <div className="text-slate-400 text-sm">
                    Conexões de Confiança
                  </div>
                </div>

                <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-neon-green to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:animate-glow">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-neon-green">
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                      `${stats?.trustRate || 0}%`
                    )}
                  </div>
                  <div className="text-slate-400 text-sm">
                    Taxa de Confiança
                  </div>
                </div>

                <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-neon-yellow to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:animate-glow">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-neon-yellow">
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                      stats?.totalTransactions || 0
                    )}
                  </div>
                  <div className="text-slate-400 text-sm">
                    Transações Validadas
                  </div>
                </div>
              </div>

              {/* User Profile Section */}
              {userProfile && !userProfile.exists && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-metis-500" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Crie seu Perfil TrustChain
                  </h3>
                  <p className="text-slate-300 mb-4">
                    Você ainda não possui um perfil no TrustChain. Crie agora
                    para começar a construir sua reputação!
                  </p>
                  <Button
                    onClick={() => {
                      const username = prompt('Digite seu nome de usuário:')
                      if (username) handleCreateProfile(username)
                    }}
                    disabled={loading}
                    className="bg-metis-600 hover:bg-metis-700 text-white px-8 py-3"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Criar Perfil
                  </Button>
                </div>
              )}

              {/* Tab Navigation */}
              <div className="flex flex-wrap justify-center gap-2 p-2 bg-slate-800/50 rounded-2xl backdrop-blur-sm">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-metis-600 text-white shadow-lg shadow-metis-600/25'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  )
                })}
              </div>

              {/* Tab Content */}
              <div className="glass-card p-8">
                {activeTab === 'overview' && userProfile && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6">
                      Visão Geral do Perfil
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">
                            Nome de Usuário:
                          </span>
                          <span className="text-white font-medium">
                            {userProfile.username || 'Não definido'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">
                            Pontuação de Confiança:
                          </span>
                          <span className="text-metis-400 font-bold">
                            {userProfile.trustScore}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">
                            Nível de Reputação:
                          </span>
                          <span className="text-neon-green font-medium">
                            {userProfile.reputation}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Conexões:</span>
                          <span className="text-white font-medium">
                            {userProfile.connectionsCount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Transações:</span>
                          <span className="text-white font-medium">
                            {userProfile.transactionsCount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Membro desde:</span>
                          <span className="text-white font-medium">
                            {new Date(
                              userProfile.joinDate,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'connections' && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Conexões em Desenvolvimento
                    </h3>
                    <p className="text-slate-400">
                      Esta funcionalidade será implementada em breve.
                    </p>
                  </div>
                )}

                {activeTab === 'reputation' && userProfile && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6">
                      Sistema de Reputação
                    </h2>
                    <div className="bg-slate-700/50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-300">Pontuação Atual</span>
                        <span className="text-2xl font-bold text-metis-400">
                          {userProfile.trustScore}
                        </span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-metis-500 to-neon-green h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              (userProfile.trustScore / 1000) * 100,
                              100,
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="mt-2 text-sm text-slate-400">
                        Nível: {userProfile.reputation}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Histórico de Atividades
                    </h3>
                    <p className="text-slate-400">
                      Esta funcionalidade será implementada em breve.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => setShowLearnMoreModal(true)}
                  variant="outline"
                  className="border-metis-600 text-metis-400 hover:bg-metis-600 hover:text-white px-8 py-3"
                >
                  Saiba Mais
                </Button>
              </div>
            </>
          )}

          {/* Modal */}
          {showLearnMoreModal && <LearnMoreModal />}
        </div>
      </div>
    </div>
  )
}
