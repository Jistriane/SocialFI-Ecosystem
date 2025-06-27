// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import { useState, useEffect } from 'react'
import { Vote, Plus, Eye, Award, Users, X, Calendar, AlertCircle, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/contexts/LocaleContext'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useGovGame } from '@/hooks/useContract'
import { useToast } from '@/components/ui/use-toast'

interface Proposal {
  id: number
  proposer: string
  title: string
  description: string
  category: string
  votesFor: bigint
  votesAgainst: bigint
  startTime: bigint
  endTime: bigint
  status: 'Active' | 'Passed' | 'Failed' | 'Cancelled'
}

interface UserStats {
  votesGiven: number
  rewards: number
  proposalsCreated: number
  participation: number
}

export default function GovGamePage() {
  const { t } = useLocale()
  const { address, isConnected } = useAccount()
  const [showNewProposalModal, setShowNewProposalModal] = useState(false)
  const [showActiveProposalsModal, setShowActiveProposalsModal] = useState(false)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [userStats, setUserStats] = useState<UserStats>({
    votesGiven: 0,
    rewards: 0,
    proposalsCreated: 0,
    participation: 0
  })
  const [loading, setLoading] = useState(false)
  const { getProposals, createProposal, vote } = useGovGame()
  const { toast } = useToast()

  // Form data para nova proposta
  const [proposalForm, setProposalForm] = useState({
    title: '',
    description: '',
    category: 'general'
  })

  // Carregar propostas reais do contrato
  useEffect(() => {
    const loadProposals = async () => {
      if (!isConnected) return

      try {
        setLoading(true)
        const contractProposals = await getProposals()
        
        // Converter dados do contrato para o formato da interface
        const formattedProposals: Proposal[] = contractProposals?.map((proposal: any) => ({
          id: Number(proposal.id) || 0,
          proposer: proposal.proposer || '',
          title: proposal.title || '',
          description: proposal.description || '',
          category: proposal.category || 'Geral',
          votesFor: BigInt(proposal.votesFor || 0),
          votesAgainst: BigInt(proposal.votesAgainst || 0),
          startTime: BigInt(proposal.startTime || Date.now()),
          endTime: BigInt(proposal.endTime || Date.now() + 604800000),
          status: proposal.isActive ? 'Active' : 'Passed'
        })) || []

        setProposals(formattedProposals)
        
        // Calcular estatísticas do usuário baseadas nas propostas
        if (address) {
          const userProposals = formattedProposals.filter(p => p.proposer.toLowerCase() === address.toLowerCase())
          setUserStats({
            votesGiven: 0, // Seria necessário uma função específica no contrato
            rewards: 0, // Seria necessário uma função específica no contrato
            proposalsCreated: userProposals.length,
            participation: userProposals.length > 0 ? 85 : 0
          })
        }
      } catch (error) {
        console.error('Erro ao carregar propostas:', error)
        setProposals([]) // Sem dados simulados
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as propostas',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    loadProposals()
  }, [isConnected, getProposals, address, toast])

  const handleCreateProposal = async () => {
    if (!isConnected || !address) {
      toast({
        title: 'Erro',
        description: 'Conecte sua carteira primeiro',
        variant: 'destructive'
      })
      return
    }

    if (!proposalForm.title || !proposalForm.description) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      
      // Preparar dados para o contrato
      const proposalParams = {
        title: proposalForm.title,
        description: proposalForm.description,
        category: proposalForm.category
      }

      await createProposal(proposalParams)
      
      toast({
        title: 'Sucesso!',
        description: 'Proposta criada com sucesso!',
      })
      
      setProposalForm({ title: '', description: '', category: 'general' })
      setShowNewProposalModal(false)
      
      // Recarregar propostas
      window.location.reload()
    } catch (error) {
      console.error('Erro ao criar proposta:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a proposta. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (proposalId: number, support: boolean) => {
    if (!isConnected || !address) {
      toast({
        title: 'Erro',
        description: 'Conecte sua carteira primeiro',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      await vote(proposalId, support)
      
      toast({
        title: 'Sucesso!',
        description: `Voto registrado com sucesso! Você votou ${support ? 'A FAVOR' : 'CONTRA'} da proposta.`,
      })
      
      // Recarregar propostas
      window.location.reload()
    } catch (error) {
      console.error('Erro ao votar:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar o voto. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatTimeRemaining = (endTime: bigint) => {
    const now = Date.now()
    const end = Number(endTime)
    const diff = end - now
    
    if (diff <= 0) return 'Expirada'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h restantes`
    return `${hours}h restantes`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <div className="container mx-auto p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <section className="text-center space-y-4">
          <div className="flex justify-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                <Vote className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white">GovGame</h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Sistema de governança descentralizada gamificada
          </p>
        </section>

          {/* Connection Status */}
          {!isConnected && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-lg font-semibold text-white mb-2">Conecte sua Carteira</h3>
              <p className="text-slate-300 mb-4">Para participar da governança, você precisa conectar sua carteira primeiro.</p>
              <ConnectButton.Custom>
                {({ account, chain, openConnectModal, mounted }) => {
                  return (
                    <Button
                      onClick={openConnectModal}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
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
              {/* User Stats */}
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
                  <Vote className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                  <div className="text-2xl font-bold text-white mb-1">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : userStats.votesGiven}
                  </div>
                  <div className="text-slate-400 text-sm">Votos Dados</div>
                </div>
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
                  <Award className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
                  <div className="text-2xl font-bold text-white mb-1">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : userStats.rewards}
          </div>
                  <div className="text-slate-400 text-sm">Recompensas</div>
          </div>
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
                  <Plus className="w-8 h-8 mx-auto mb-3 text-green-400" />
                  <div className="text-2xl font-bold text-white mb-1">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : userStats.proposalsCreated}
          </div>
                  <div className="text-slate-400 text-sm">Propostas Criadas</div>
          </div>
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                  <div className="text-2xl font-bold text-white mb-1">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : `${userStats.participation}%`}
                  </div>
                  <div className="text-slate-400 text-sm">Participação</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => setShowNewProposalModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 flex items-center space-x-2"
                  disabled={loading}
                >
                  <Plus className="w-5 h-5" />
                  <span>Nova Proposta</span>
                </Button>
                <Button
                  onClick={() => setShowActiveProposalsModal(true)}
                  variant="outline"
                  className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white px-8 py-3 flex items-center space-x-2"
                  disabled={loading}
                >
                  <Eye className="w-5 h-5" />
                  <span>Ver Propostas Ativas</span>
                </Button>
          </div>

              {/* Recent Proposals */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Propostas Recentes</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
                    <p className="text-slate-400">Carregando propostas...</p>
                  </div>
                ) : proposals.length === 0 ? (
                  <div className="text-center py-8">
                    <Vote className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400">Nenhuma proposta encontrada</p>
                    <p className="text-slate-500 text-sm mt-2">Seja o primeiro a criar uma proposta!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proposals.slice(0, 5).map((proposal) => (
                      <div key={proposal.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">{proposal.title}</h3>
                            <p className="text-slate-400 text-sm mb-2">{proposal.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-slate-500">
                              <span>Por: {proposal.proposer.slice(0, 10)}...</span>
                              <span>{proposal.category}</span>
                              <span>{formatTimeRemaining(proposal.endTime)}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <div className="text-center">
                              <div className="text-green-400 font-bold">{Number(proposal.votesFor)}</div>
                              <div className="text-xs text-slate-500">A favor</div>
                            </div>
                            <div className="text-center">
                              <div className="text-red-400 font-bold">{Number(proposal.votesAgainst)}</div>
                              <div className="text-xs text-slate-500">Contra</div>
                            </div>
                          </div>
          </div>
                        
                        {proposal.status === 'Active' && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleVote(proposal.id, true)}
                              disabled={loading}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 flex items-center justify-center space-x-1"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span>A Favor</span>
                            </Button>
                            <Button
                              onClick={() => handleVote(proposal.id, false)}
                              disabled={loading}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 flex items-center justify-center space-x-1"
                            >
                              <ThumbsDown className="w-4 h-4" />
                              <span>Contra</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Modal Nova Proposta */}
          {showNewProposalModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-700">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Nova Proposta</h2>
                    <button
                      onClick={() => setShowNewProposalModal(false)}
                      className="text-slate-400 hover:text-white transition-colors"
                      aria-label="Fechar modal"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Título da Proposta
                      </label>
                      <input
                        type="text"
                        value={proposalForm.title}
                        onChange={(e) => setProposalForm({...proposalForm, title: e.target.value})}
                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Digite o título da proposta"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Descrição
                      </label>
                      <textarea
                        value={proposalForm.description}
                        onChange={(e) => setProposalForm({...proposalForm, description: e.target.value})}
                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none"
                        placeholder="Descreva detalhadamente sua proposta"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Categoria
                      </label>
                      <select
                        value={proposalForm.category}
                        onChange={(e) => setProposalForm({...proposalForm, category: e.target.value})}
                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        aria-label="Selecionar categoria"
                      >
                        <option value="general">Geral</option>
                        <option value="development">Desenvolvimento</option>
                        <option value="economy">Economia</option>
                        <option value="governance">Governança</option>
                        <option value="security">Segurança</option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewProposalModal(false)}
                        className="flex-1"
                        disabled={loading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateProposal}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Criar Proposta
                      </Button>
                    </div>
                  </div>
            </div>
              </div>
            </div>
          )}

          {/* Modal Ver Propostas Ativas */}
          {showActiveProposalsModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Propostas Ativas</h2>
                    <button
                      onClick={() => setShowActiveProposalsModal(false)}
                      className="text-slate-400 hover:text-white transition-colors"
                      aria-label="Fechar modal"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {loading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
                        <p className="text-slate-400">Carregando propostas...</p>
                      </div>
                    ) : proposals.filter(p => p.status === 'Active').length === 0 ? (
                      <div className="text-center py-8">
                        <Vote className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                        <p className="text-slate-400">Nenhuma proposta ativa encontrada</p>
                      </div>
                    ) : (
                      proposals.filter(p => p.status === 'Active').map((proposal) => (
                        <div key={proposal.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                          <h3 className="font-semibold text-white mb-2">{proposal.title}</h3>
                          <p className="text-slate-300 text-sm mb-3">{proposal.description}</p>
                          
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center space-x-4 text-sm text-slate-400">
                              <span>Por: {proposal.proposer.slice(0, 10)}...</span>
                              <span>{proposal.category}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-slate-400">
                              <Calendar className="w-4 h-4" />
                              <span>{formatTimeRemaining(proposal.endTime)}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex space-x-4">
                              <div className="text-center">
                                <div className="text-green-400 font-bold">{Number(proposal.votesFor)}</div>
                                <div className="text-xs text-slate-500">A favor</div>
                              </div>
                              <div className="text-center">
                                <div className="text-red-400 font-bold">{Number(proposal.votesAgainst)}</div>
                                <div className="text-xs text-slate-500">Contra</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleVote(proposal.id, true)}
                              disabled={loading}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 flex items-center justify-center space-x-1"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span>A Favor</span>
                            </Button>
                            <Button
                              onClick={() => handleVote(proposal.id, false)}
                              disabled={loading}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 flex items-center justify-center space-x-1"
                            >
                              <ThumbsDown className="w-4 h-4" />
                              <span>Contra</span>
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
      </div>
    </div>
  )
}
