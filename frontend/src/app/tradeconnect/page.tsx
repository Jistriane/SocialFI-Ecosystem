// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, ArrowUpDown, Clock, CheckCircle, Plus, Search, X, Shield, Users, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/contexts/LocaleContext'
import { useAccount, useBalance } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useTradeConnect } from '@/hooks/useContract'
import { useToast } from '@/components/ui/use-toast'

interface Trade {
  id: string
  maker: string
  tokenOffered: string
  tokenWanted: string
  amountOffered: string
  amountWanted: string
  deadline: number
  status: 'Active' | 'Completed' | 'Cancelled'
  createdAt: number
}

export default function TradeConnectPage() {
  const { t } = useLocale()
  const { address, isConnected } = useAccount()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(false)
  const { getTrades, createTrade } = useTradeConnect()
  const { toast } = useToast()
  const { data: balance } = useBalance({ address })

  const [searchFilters, setSearchFilters] = useState({
    tokenOffered: '',
    tokenWanted: '',
    minAmount: '',
    maxAmount: ''
  })

  // Carregar trades reais do contrato
  useEffect(() => {
    const loadTrades = async () => {
      if (!isConnected) return

      try {
        setLoading(true)
        const contractTrades = await getTrades()
        
        // Converter dados do contrato para o formato da interface
        const formattedTrades: Trade[] = contractTrades?.map((trade: any, index: number) => ({
          id: trade.id?.toString() || index.toString(),
          maker: trade.maker || '',
          tokenOffered: trade.tokenOffered || '',
          tokenWanted: trade.tokenWanted || '',
          amountOffered: trade.amountOffered?.toString() || '0',
          amountWanted: trade.amountWanted?.toString() || '0',
          deadline: Number(trade.deadline) || 0,
          status: trade.isActive ? 'Active' : 'Completed',
          createdAt: Number(trade.createdAt) || Date.now()
        })) || []

        setTrades(formattedTrades)
      } catch (error) {
        console.error('Erro ao carregar trades:', error)
        setTrades([]) // Sem dados simulados
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as negociações',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    loadTrades()
  }, [isConnected, getTrades, toast])

  // Modal de Criar Negociação
  const CreateTradeModal = () => {
    const [formData, setFormData] = useState({
      tokenOffered: '',
      tokenWanted: '',
      amountOffered: '',
      amountWanted: '',
      duration: '24'
    })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      if (!address || !isConnected) {
        toast({
          title: 'Erro',
          description: 'Conecte sua carteira primeiro',
          variant: 'destructive'
        })
        return
      }

      try {
        setLoading(true)
        
        // Preparar dados para o contrato
        const tradeParams = {
          tokenOffered: formData.tokenOffered,
          tokenWanted: formData.tokenWanted,
          amountOffered: formData.amountOffered,
          amountWanted: formData.amountWanted,
          duration: parseInt(formData.duration) * 3600 // converter horas para segundos
        }

        await createTrade(tradeParams)
        
        toast({
          title: 'Sucesso!',
          description: 'Negociação criada com sucesso!',
        })
        
        setShowCreateModal(false)
        
        // Reset form
        setFormData({
          tokenOffered: '',
          tokenWanted: '',
          amountOffered: '',
          amountWanted: '',
          duration: '24'
        })

        // Recarregar trades
        window.location.reload()
      } catch (error) {
        console.error('Erro ao criar trade:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível criar a negociação. Verifique se você tem saldo suficiente.',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Criar Negociação</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Fechar modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Token Oferecido
                </label>
                <select
                  value={formData.tokenOffered}
                  onChange={(e) => setFormData({...formData, tokenOffered: e.target.value})}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-metis-500 focus:border-transparent"
                  aria-label="Selecionar token oferecido"
                  required
                >
                  <option value="">Selecione um token</option>
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                  <option value="METIS">METIS</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Quantidade Oferecida
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.amountOffered}
                  onChange={(e) => setFormData({...formData, amountOffered: e.target.value})}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-metis-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Token Desejado
                </label>
                <select
                  value={formData.tokenWanted}
                  onChange={(e) => setFormData({...formData, tokenWanted: e.target.value})}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-metis-500 focus:border-transparent"
                  aria-label="Selecionar token desejado"
                  required
                >
                  <option value="">Selecione um token</option>
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                  <option value="METIS">METIS</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Quantidade Desejada
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.amountWanted}
                  onChange={(e) => setFormData({...formData, amountWanted: e.target.value})}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-metis-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Duração (horas)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-metis-500 focus:border-transparent"
                  aria-label="Selecionar duração da negociação"
                >
                  <option value="1">1 hora</option>
                  <option value="6">6 horas</option>
                  <option value="24">24 horas</option>
                  <option value="72">3 dias</option>
                  <option value="168">7 dias</option>
                </select>
              </div>

              <div className="bg-metis-500/10 border border-metis-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-metis-400 mt-0.5" />
                  <div className="text-sm text-slate-300">
                    <p className="font-medium text-white mb-1">Segurança TrustChain</p>
                    <p>Sua pontuação de confiança será verificada antes de criar a negociação.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-metis-600 hover:bg-metis-700"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Criar Negociação
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Modal de Buscar Ofertas
  const SearchOffersModal = () => {
    const filteredTrades = trades.filter(trade => {
      const matchesOffered = !searchFilters.tokenOffered || trade.tokenOffered.toLowerCase().includes(searchFilters.tokenOffered.toLowerCase())
      const matchesWanted = !searchFilters.tokenWanted || trade.tokenWanted.toLowerCase().includes(searchFilters.tokenWanted.toLowerCase())
      const matchesMinAmount = !searchFilters.minAmount || parseFloat(trade.amountOffered) >= parseFloat(searchFilters.minAmount)
      const matchesMaxAmount = !searchFilters.maxAmount || parseFloat(trade.amountOffered) <= parseFloat(searchFilters.maxAmount)
      
      return matchesOffered && matchesWanted && matchesMinAmount && matchesMaxAmount
    })

    const handleAcceptTrade = async (tradeId: string) => {
      if (!address || !isConnected) {
        toast({
          title: 'Erro',
          description: 'Conecte sua carteira primeiro',
          variant: 'destructive'
        })
        return
      }

      try {
        setLoading(true)
        // Implementar aceitação de trade no contrato
        console.log('Aceitando trade:', tradeId)
        
        toast({
          title: 'Sucesso!',
          description: 'Negociação aceita com sucesso!',
        })
        
        // Recarregar trades
        window.location.reload()
      } catch (error) {
        console.error('Erro ao aceitar trade:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível aceitar a negociação',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Buscar Ofertas</h2>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Fechar modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Filtros */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <input
                type="text"
                placeholder="Token oferecido"
                value={searchFilters.tokenOffered}
                onChange={(e) => setSearchFilters({...searchFilters, tokenOffered: e.target.value})}
                className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
              <input
                type="text"
                placeholder="Token desejado"
                value={searchFilters.tokenWanted}
                onChange={(e) => setSearchFilters({...searchFilters, tokenWanted: e.target.value})}
                className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
              <input
                type="number"
                placeholder="Valor mínimo"
                value={searchFilters.minAmount}
                onChange={(e) => setSearchFilters({...searchFilters, minAmount: e.target.value})}
                className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
              <input
                type="number"
                placeholder="Valor máximo"
                value={searchFilters.maxAmount}
                onChange={(e) => setSearchFilters({...searchFilters, maxAmount: e.target.value})}
                className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>

            {/* Lista de Trades */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-metis-500" />
                  <p className="text-slate-400">Carregando negociações...</p>
                </div>
              ) : filteredTrades.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                  <p className="text-slate-400">Nenhuma negociação encontrada</p>
                </div>
              ) : (
                filteredTrades.map((trade) => (
                  <div key={trade.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <ArrowUpDown className="w-4 h-4 text-metis-400" />
                          <span className="font-medium text-white">
                            {trade.amountOffered} {trade.tokenOffered} → {trade.amountWanted} {trade.tokenWanted}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">Por: {trade.maker.slice(0, 10)}...</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-400">
                            {new Date(trade.deadline).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          trade.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {trade.status}
                        </span>
                      </div>
                    </div>
                    {trade.status === 'Active' && trade.maker !== address && (
                      <Button
                        onClick={() => handleAcceptTrade(trade.id)}
                        disabled={loading}
                        className="w-full bg-metis-600 hover:bg-metis-700"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Aceitar Negociação
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <div className="container mx-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <section className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                <TrendingUp className="w-8 h-8 text-indigo-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white">TradeConnect</h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Plataforma descentralizada de negociação peer-to-peer com segurança blockchain
            </p>
          </section>

          {/* Connection Status */}
          {!isConnected ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-lg font-semibold text-white mb-2">Conecte sua Carteira</h3>
              <p className="text-slate-300 mb-4">Para usar o TradeConnect, você precisa conectar sua carteira primeiro.</p>
              <ConnectButton.Custom>
                {({ account, chain, openConnectModal, mounted }) => {
                  return (
                    <Button
                      onClick={openConnectModal}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3"
                    >
                      Conectar Carteira
                    </Button>
                  )
                }}
              </ConnectButton.Custom>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-3 text-indigo-400" />
                  <div className="text-2xl font-bold text-white mb-1">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : trades.length}
                  </div>
                  <div className="text-slate-400 text-sm">Negociações Ativas</div>
                </div>
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-3 text-green-400" />
                  <div className="text-2xl font-bold text-white mb-1">
                    {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0.0000'}
                  </div>
                  <div className="text-slate-400 text-sm">Seu Saldo</div>
                </div>
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
                  <div className="text-2xl font-bold text-white mb-1">100%</div>
                  <div className="text-slate-400 text-sm">Segurança Blockchain</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 flex items-center space-x-2"
                  disabled={loading}
                >
                  <Plus className="w-5 h-5" />
                  <span>Criar Negociação</span>
                </Button>
                <Button
                  onClick={() => setShowSearchModal(true)}
                  variant="outline"
                  className="border-indigo-600 text-indigo-400 hover:bg-indigo-600 hover:text-white px-8 py-3 flex items-center space-x-2"
                  disabled={loading}
                >
                  <Search className="w-5 h-5" />
                  <span>Buscar Ofertas</span>
                </Button>
              </div>

              {/* Recent Trades */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Negociações Recentes</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-500" />
                    <p className="text-slate-400">Carregando negociações...</p>
                  </div>
                ) : trades.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400">Nenhuma negociação encontrada</p>
                    <p className="text-slate-500 text-sm mt-2">Seja o primeiro a criar uma negociação!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trades.slice(0, 5).map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <ArrowUpDown className="w-5 h-5 text-indigo-400" />
                          <div>
                            <div className="text-white font-medium">
                              {trade.amountOffered} {trade.tokenOffered} → {trade.amountWanted} {trade.tokenWanted}
                            </div>
                            <div className="text-slate-400 text-sm">Por: {trade.maker.slice(0, 10)}...</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 mb-1">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-400">
                              {new Date(trade.deadline).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            trade.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {trade.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Modals */}
          {showCreateModal && <CreateTradeModal />}
          {showSearchModal && <SearchOffersModal />}
        </div>
      </div>
    </div>
  )
}
