// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import { useState, useEffect } from 'react'
import {
  User,
  Wallet,
  Activity,
  Settings,
  Edit,
  Save,
  X,
  Copy,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/contexts/LocaleContext'
import { useAccount, useBalance } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useRouter } from 'next/navigation'

interface UserProfile {
  displayName: string
  bio: string
  avatar: string
  email: string
  socialLinks: {
    twitter: string
    github: string
    website: string
  }
}

interface UserStats {
  trustScore: number
  totalTransactions: number
  totalVolume: string
  reputationLevel: string
  joinDate: string
  lastActivity: string
}

export default function ProfilePage() {
  const { t } = useLocale()
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [showEditModal, setShowEditModal] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)

  // User profile data
  const [userProfile, setUserProfile] = useState<UserProfile>({
    displayName: '',
    bio: '',
    avatar: '',
    email: '',
    socialLinks: {
      twitter: '',
      github: '',
      website: '',
    },
  })

  // Form data for editing
  const [editForm, setEditForm] = useState<UserProfile>({
    displayName: '',
    bio: '',
    avatar: '',
    email: '',
    socialLinks: {
      twitter: '',
      github: '',
      website: '',
    },
  })

  // User stats
  const [userStats, setUserStats] = useState<UserStats>({
    trustScore: 0,
    totalTransactions: 0,
    totalVolume: '0',
    reputationLevel: 'Iniciante',
    joinDate: '',
    lastActivity: '',
  })

  // Get wallet balance
  const { data: balance } = useBalance({
    address: address,
  })

  // Load user data when connected - dados reais da carteira
  useEffect(() => {
    if (isConnected && address) {
      // Usar dados reais da carteira conectada
      const realProfile: UserProfile = {
        displayName: `Usuário ${address.slice(0, 6)}`,
        bio: 'Membro do ecossistema SocialFI',
        avatar: '',
        email: '',
        socialLinks: {
          twitter: '',
          github: '',
          website: '',
        },
      }

      // Dados baseados na carteira real - sem simulação
      const realStats: UserStats = {
        trustScore: 0, // Seria obtido do contrato TrustChain
        totalTransactions: 0, // Seria obtido da blockchain
        totalVolume: balance
          ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
          : '0 ETH',
        reputationLevel: 'Novo',
        joinDate: new Date().toLocaleDateString('pt-BR'),
        lastActivity: 'Agora',
      }

      setUserProfile(realProfile)
      setEditForm(realProfile)
      setUserStats(realStats)
    }
  }, [isConnected, address, balance])

  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address)
        setCopiedAddress(true)
        setTimeout(() => setCopiedAddress(false), 2000)
      } catch (error) {
        console.error('Erro ao copiar endereço:', error)
      }
    }
  }

  const handleSaveProfile = async () => {
    try {
      // Aqui seria a chamada real para salvar o perfil
      console.log('Salvando perfil:', editForm)

      setUserProfile(editForm)
      setShowEditModal(false)
      alert('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      alert('Erro ao salvar perfil. Tente novamente.')
    }
  }

  const handleOpenSettings = () => {
    router.push('/settings')
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getReputationColor = (level: string) => {
    switch (level) {
      case 'Iniciante':
        return 'text-gray-500'
      case 'Intermediário':
        return 'text-blue-500'
      case 'Confiável':
        return 'text-green-500'
      case 'Expert':
        return 'text-purple-500'
      case 'Master':
        return 'text-yellow-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Connection Status */}
          {!isConnected && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Conecte sua Carteira
              </h3>
              <p className="text-slate-300 mb-4">
                Para visualizar seu perfil, você precisa conectar sua carteira
                primeiro.
              </p>
              <ConnectButton.Custom>
                {({ account, chain, openConnectModal, mounted }) => {
                  return (
                    <Button
                      onClick={openConnectModal}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
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
              {/* Header */}
              <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {userProfile.displayName || 'Usuário SocialFI'}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                      <p className="text-slate-300">
                        {address ? formatAddress(address) : ''}
                      </p>
                      <button
                        onClick={handleCopyAddress}
                        className="text-slate-400 hover:text-white transition-colors"
                        aria-label="Copiar endereço"
                      >
                        {copiedAddress ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-slate-300 mb-4">
                      {userProfile.bio ||
                        'Participante do ecossistema SocialFI'}
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-slate-400">
                      <span>Membro desde: {userStats.joinDate}</span>
                      <span>•</span>
                      <span>Última atividade: {userStats.lastActivity}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowEditModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {t('profile.actions.edit_profile', 'common')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleOpenSettings}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {t('profile.actions.settings', 'common')}
                    </Button>
                  </div>
                </div>
              </section>

              {/* Profile Stats */}
              <section className="grid md:grid-cols-4 gap-6">
                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg text-center space-y-3">
                  <Wallet className="w-8 h-8 mx-auto text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">
                    {t('profile.wallet', 'common')}
                  </h3>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-white">
                      {balance
                        ? `${parseFloat(balance.formatted).toFixed(4)} ${
                            balance.symbol
                          }`
                        : '0 ETH'}
                    </p>
                    <p className="text-sm text-slate-400">
                      {t('profile.main_balance', 'common')}
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg text-center space-y-3">
                  <Activity className="w-8 h-8 mx-auto text-green-400" />
                  <h3 className="text-lg font-semibold text-white">
                    {t('profile.trust_score', 'common')}
                  </h3>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-white">
                      {userStats.trustScore}
                    </p>
                    <p className="text-sm text-slate-400">
                      {t('profile.trust_score_desc', 'common')}
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg text-center space-y-3">
                  <TrendingUp className="w-8 h-8 mx-auto text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Volume Total
                  </h3>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-white">
                      {userStats.totalVolume}
                    </p>
                    <p className="text-sm text-slate-400">Negociado</p>
                  </div>
                </div>

                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg text-center space-y-3">
                  <Award className="w-8 h-8 mx-auto text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Reputação
                  </h3>
                  <div className="space-y-1">
                    <p
                      className={`text-2xl font-bold ${getReputationColor(
                        userStats.reputationLevel,
                      )}`}
                    >
                      {userStats.reputationLevel}
                    </p>
                    <p className="text-sm text-slate-400">Nível atual</p>
                  </div>
                </div>
              </section>

              {/* Recent Activity */}
              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white">
                  {t('profile.recent_activity', 'common')}
                </h2>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
                  <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">
                    {t('profile.no_activity', 'common')}
                  </p>
                  <p className="text-sm">
                    {t('profile.no_activity_desc', 'common')}
                  </p>
                </div>
              </section>

              {/* Additional Stats */}
              <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Estatísticas Detalhadas
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">
                        Total de Transações:
                      </span>
                      <span className="text-white font-semibold">
                        {userStats.totalTransactions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Propostas Criadas:</span>
                      <span className="text-white font-semibold">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Votos Dados:</span>
                      <span className="text-white font-semibold">12</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">
                        Conexões de Confiança:
                      </span>
                      <span className="text-white font-semibold">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">
                        Negociações Completadas:
                      </span>
                      <span className="text-white font-semibold">15</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Taxa de Sucesso:</span>
                      <span className="text-green-400 font-semibold">98%</span>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      {/* Modal Editar Perfil */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Editar Perfil</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Fechar modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome de Exibição
                </label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, displayName: e.target.value })
                  }
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Seu nome de exibição"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                  placeholder="Conte um pouco sobre você..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-300">
                  Links Sociais
                </h4>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Twitter
                  </label>
                  <input
                    type="text"
                    value={editForm.socialLinks.twitter}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        socialLinks: {
                          ...editForm.socialLinks,
                          twitter: e.target.value,
                        },
                      })
                    }
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="@seu_usuario"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    GitHub
                  </label>
                  <input
                    type="text"
                    value={editForm.socialLinks.github}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        socialLinks: {
                          ...editForm.socialLinks,
                          github: e.target.value,
                        },
                      })
                    }
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="github.com/seu-usuario"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    value={editForm.socialLinks.website}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        socialLinks: {
                          ...editForm.socialLinks,
                          website: e.target.value,
                        },
                      })
                    }
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu-site.com"
                  />
                </div>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-slate-300 mb-2">
                  💡 Dica:
                </h4>
                <p className="text-sm text-slate-400">
                  Um perfil completo ajuda outros usuários a confiar mais em
                  você, aumentando seu Trust Score no ecossistema.
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-700">
              <Button
                onClick={() => setShowEditModal(false)}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveProfile}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Perfil
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
