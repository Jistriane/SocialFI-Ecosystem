// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useContract } from '@/hooks/useContract'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { 
  Shield,
  Activity,
  RefreshCw,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

interface UserProfile {
  username: string
  isVerified: boolean
  trustScore: bigint
  lastUpdate: bigint
}

export function ContractTest() {
  const { toast } = useToast()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { readContract, writeContract, events } = useContract('TrustChain')
  
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [trustScore, setTrustScore] = useState<bigint | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0)

  // Estado de mounted para evitar hidratação mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Função para obter informações da rede atual
  const getNetworkInfo = useCallback(() => {
    if (chainId === 11155111) {
      return {
        name: 'Ethereum Sepolia',
        script: 'create-test-profile-sepolia.js',
        color: 'from-blue-500 to-blue-600'
      }
    } else if (chainId === 59902) {
      return {
        name: 'Metis Sepolia',
        script: 'create-test-profile-metis.js',
        color: 'from-metis-500 to-metis-600'
      }
    }
    return {
      name: 'Rede Desconhecida',
      script: 'create-test-profile.js',
      color: 'from-slate-500 to-slate-600'
    }
  }, [chainId])

  // Função para buscar dados do perfil
  const fetchUserData = useCallback(async () => {
    if (!address || !mounted || !isConnected || !readContract) {
      return
    }
    
    console.log('🔍 Buscando dados para endereço:', address)
    setIsLoading(true)
    
    try {
      // Primeiro, tentar obter o perfil completo
      console.log('📋 Tentando getUserProfile...')
      const profileData = await readContract('getUserProfile', [address])
      console.log('✅ ProfileData recebido:', profileData)
      
      // Verificar se o perfil existe (username não vazio)
      if (
        profileData &&
        Array.isArray(profileData) &&
        profileData[0] &&
        profileData[0].trim() !== ''
      ) {
        const userProfile: UserProfile = {
          username: profileData[0],
          isVerified: profileData[1], 
          trustScore: profileData[2],
          lastUpdate: profileData[3]
        }
        
        setProfile(userProfile)
        setTrustScore(userProfile.trustScore)
        setLastUpdateTime(Date.now())
        
        console.log('✅ Perfil carregado:', userProfile)
        
        toast({
          title: 'Dados carregados',
          description: `Perfil: ${userProfile.username} | Score: ${userProfile.trustScore.toString()}`,
        })
      }
    } catch (error: any) {
      console.log('⚠️ Perfil não encontrado:', error.message)
      
      // Se o perfil não existir, definir valores padrão
      setTrustScore(BigInt(0))
      setProfile(null)
      setLastUpdateTime(Date.now())
      
      if (error.message?.includes('Profile does not exist') || 
          error.message?.includes('does not exist')) {
        console.log('👤 Usuário sem perfil - estado inicial')
        // Não mostrar toast para perfil não encontrado, o aviso visual já cobre isso
      } else {
        console.error('❌ Erro inesperado:', error)
        toast({
          title: 'Erro ao carregar dados',
          description: 'Verifique se está conectado à rede correta',
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [address, mounted, isConnected, readContract, toast])

  // Função para criar perfil
  const createProfile = useCallback(async () => {
    if (!address || !mounted || !isConnected || !writeContract) return
    
    setIsLoading(true)
    try {
      const username = `user_${address.slice(-8)}`
      console.log('🆕 Criando perfil com username:', username)
      
      await writeContract('createProfile', [username])
      
      toast({
        title: 'Sucesso!',
        description: 'Perfil criado com sucesso!',
      })
      
      // Aguardar e buscar dados novamente
      setTimeout(() => {
        fetchUserData()
      }, 3000)
      
    } catch (error: any) {
      console.error('❌ Erro ao criar perfil:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao criar perfil. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [address, mounted, isConnected, writeContract, toast, fetchUserData])

  // Carregar dados quando carteira conectar - com debounce
  useEffect(() => {
    if (!isConnected || !address || !mounted) return

    const timeoutId = setTimeout(() => {
      console.log('🔗 Carteira conectada, carregando dados...')
      fetchUserData()
    }, 500) // Debounce de 500ms

    return () => clearTimeout(timeoutId)
  }, [isConnected, address, mounted, fetchUserData])

  // Renderização de loading inicial
  if (!mounted) {
    return (
      <div className="glass-card p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-slate-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Carregando...</h3>
          <p className="text-slate-400">Inicializando componente</p>
        </div>
      </div>
    )
  }

  // Renderização quando carteira não conectada
  if (!isConnected) {
    return (
      <div className="glass-card p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-slate-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">TrustChain Integration</h3>
          <p className="text-slate-400">Conecte sua carteira para acessar os dados do TrustChain</p>
        </div>
      </div>
    )
  }

  const timeSinceUpdate = lastUpdateTime ? Math.floor((Date.now() - lastUpdateTime) / 1000) : 0
  const networkInfo = getNetworkInfo()

  return (
    <div className="space-y-6">
      {/* Header com status de conexão */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-metis-500 to-hyperion-500 rounded-2xl flex items-center justify-center mx-auto animate-glow">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white">TrustChain Integration</h3>
        <p className="text-slate-400">
          Endereço: <span className="text-metis-400 font-mono text-sm">{address}</span>
        </p>
        <p className="text-sm text-slate-500">
          Rede: <span className="text-metis-400">{networkInfo.name}</span>
        </p>
        {lastUpdateTime > 0 && (
          <p className="text-xs text-slate-500">
            Última atualização: {timeSinceUpdate}s atrás
          </p>
        )}
      </div>

      {/* Card principal com dados */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-metis-400" />
            Trust Score
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-metis-400" />}
          </h4>
          <div className="text-3xl font-bold text-metis-400">
            {trustScore?.toString() || '0'}
          </div>
        </div>
        
        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-700">
            <div className="text-center">
              <div className="text-sm text-slate-400">Username</div>
              <div className="text-white font-medium">{profile.username}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400">Verificado</div>
              <div className={`font-medium flex items-center justify-center gap-1 ${profile.isVerified ? 'text-green-400' : 'text-slate-400'}`}>
                {profile.isVerified ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Sim
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Não
                  </>
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400">Última Atualização</div>
              <div className="text-white font-medium text-sm">
                {new Date(Number(profile.lastUpdate) * 1000).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Aviso para criar perfil se não existir */}
      {!profile && isConnected && (
        <div className={`glass-card p-6 border-l-4 border-yellow-500 bg-gradient-to-r ${networkInfo.color} bg-opacity-10`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Info className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex-1 space-y-3">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                Perfil Necessário - {networkInfo.name}
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Para usar o TrustChain nesta rede, você precisa criar um perfil primeiro. 
                Cada rede requer seu próprio perfil.
              </p>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h5 className="text-sm font-medium text-yellow-400 mb-2">
                  💡 Como criar seu perfil:
                </h5>
                <div className="space-y-2 text-sm text-slate-300">
                  <p><strong>Opção 1:</strong> Use o botão "Criar Perfil" abaixo</p>
                  <p><strong>Opção 2:</strong> Execute o script no terminal:</p>
                  <code className="block bg-slate-900 p-2 rounded text-metis-400 font-mono text-xs mt-2">
                    node scripts/{networkInfo.script}
                  </code>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <AlertCircle className="w-4 h-4" />
                <span>Certifique-se de ter tokens suficientes para pagar o gas da transação</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button 
          onClick={fetchUserData} 
          disabled={isLoading}
          className="metis-button flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Carregando...' : 'Atualizar Dados'}
        </Button>
        
        {!profile && (
          <Button 
            onClick={createProfile} 
            disabled={isLoading}
            className="bg-gradient-to-r from-hyperion-500 to-hyperion-600 hover:from-hyperion-400 hover:to-hyperion-500 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {isLoading ? 'Criando...' : 'Criar Perfil'}
          </Button>
        )}
      </div>

      {/* Seção de eventos simplificada */}
      {events && events.length > 0 && (
        <div className="glass-card p-6 space-y-4">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-hyperion-400" />
            Eventos Recentes ({events.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {events.slice(-3).reverse().map((event, index) => (
              <div key={index} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-metis-400 font-medium">{event.eventName}</span>
                  <span className="text-slate-500 text-xs">
                    {new Date(event.timestamp).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
                {event.transactionHash && (
                  <div className="text-slate-400 text-xs font-mono mt-1">
                    {event.transactionHash.slice(0, 10)}...{event.transactionHash.slice(-8)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 