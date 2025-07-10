// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { Socket, io } from 'socket.io-client'

// Tipos de eventos do socket
export enum SocketEvents {
  // Eventos de conexão
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CONNECT_ERROR = 'connect_error',

  // Eventos de autenticação
  AUTH_SUCCESS = 'auth:success',
  AUTH_ERROR = 'auth:error',

  // Eventos do TrustChain
  REPUTATION_UPDATE = 'trustchain:reputation_update',
  PROFILE_UPDATE = 'trustchain:profile_update',
  VERIFICATION_STATUS = 'trustchain:verification_status',

  // Eventos do GovGame
  PROPOSAL_CREATED = 'govgame:proposal_created',
  PROPOSAL_UPDATED = 'govgame:proposal_updated',
  VOTE_CAST = 'govgame:vote_cast',
  PROPOSAL_EXECUTED = 'govgame:proposal_executed',
  PROPOSAL_CANCELLED = 'govgame:proposal_cancelled',

  // Eventos do TradeConnect
  TRADE_CREATED = 'tradeconnect:trade_created',
  TRADE_UPDATED = 'tradeconnect:trade_updated',
  TRADE_COMPLETED = 'tradeconnect:trade_completed',
  TRADE_CANCELLED = 'tradeconnect:trade_cancelled',

  // Eventos do EcosystemHub
  REWARD_EARNED = 'ecosystem:reward_earned',
  LEVEL_UP = 'ecosystem:level_up',
  ACHIEVEMENT_UNLOCKED = 'ecosystem:achievement_unlocked',
}

// Interface para configuração do socket
interface SocketConfig {
  url: string
  path: string
  options: {
    autoConnect: boolean
    reconnection: boolean
    reconnectionAttempts: number
    reconnectionDelay: number
    reconnectionDelayMax: number
    timeout: number
    transports: string[]
  }
}

// Configuração padrão do socket
const defaultConfig: SocketConfig = {
  url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
  path: process.env.NEXT_PUBLIC_SOCKET_PATH || '/socket.io',
  options: {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ['websocket', 'polling'],
  },
}

// Classe para gerenciar a conexão do socket
class SocketManager {
  private static instance: SocketManager
  private socket: Socket | null = null
  private config: SocketConfig

  private constructor(config: SocketConfig = defaultConfig) {
    this.config = config
  }

  public static getInstance(config?: SocketConfig): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager(config)
    }
    return SocketManager.instance
  }

  public connect(token?: string): Socket {
    if (!this.socket) {
      this.socket = io(this.config.url, {
        ...this.config.options,
        path: this.config.path,
        auth: token ? { token } : undefined,
      })

      // Configurar handlers padrão
      this.setupDefaultHandlers()
    }
    return this.socket
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  public getSocket(): Socket | null {
    return this.socket
  }

  private setupDefaultHandlers(): void {
    if (!this.socket) return

    // Handler de conexão
    this.socket.on(SocketEvents.CONNECT, () => {
      console.log('Socket conectado')
    })

    // Handler de desconexão
    this.socket.on(SocketEvents.DISCONNECT, (reason) => {
      console.log(`Socket desconectado: ${reason}`)
    })

    // Handler de erro de conexão
    this.socket.on(SocketEvents.CONNECT_ERROR, (error) => {
      console.error('Erro de conexão do socket:', error)
    })
  }
}

export const socketManager = SocketManager.getInstance()
export type { Socket }
export { SocketManager }

export const subscribeToEvent = (
  event: string,
  callback: (data: any) => void,
): void => {
  const socket = socketManager.getSocket()
  socket?.on(event, callback)
}

export const unsubscribeFromEvent = (
  event: string,
  callback: (data: any) => void,
): void => {
  const socket = socketManager.getSocket()
  socket?.off(event, callback)
}

export const emitEvent = (event: string, data: any): void => {
  const socket = socketManager.getSocket()
  socket?.emit(event, data)
}

// Eventos personalizados
export const socketEvents = {
  // TrustChain
  trustScoreUpdated: 'trustScoreUpdated',
  trustConnectionCreated: 'trustConnectionCreated',
  trustConnectionRemoved: 'trustConnectionRemoved',

  // TradeConnect
  tradeCreated: 'tradeCreated',
  tradeUpdated: 'tradeUpdated',
  tradeCanceled: 'tradeCanceled',
  tradeCompleted: 'tradeCompleted',

  // GovGame
  proposalCreated: 'proposalCreated',
  proposalUpdated: 'proposalUpdated',
  voteSubmitted: 'voteSubmitted',
  proposalExecuted: 'proposalExecuted',

  // Rewards
  rewardsDistributed: 'rewardsDistributed',
  rewardsClaimed: 'rewardsClaimed',
}
