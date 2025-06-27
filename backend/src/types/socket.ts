// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

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

// Interface para dados de reputação
export interface ReputationData {
  address: string;
  reputation: number;
}

// Interface para dados de perfil
export interface ProfileData {
  address: string;
  profile: {
    name: string;
    bio: string;
    avatar: string;
    social: {
      twitter?: string;
      github?: string;
      discord?: string;
    };
  };
}

// Interface para dados de verificação
export interface VerificationData {
  address: string;
  isVerified: boolean;
}

// Interface para dados de proposta
export interface ProposalData {
  id: number;
  creator: string;
  title: string;
  description: string;
  startBlock: number;
  endBlock: number;
  status: 'pending' | 'active' | 'executed' | 'cancelled';
  votes: {
    for: number;
    against: number;
    abstain: number;
  };
}

// Interface para dados de voto
export interface VoteData {
  proposalId: number;
  voter: string;
  support: boolean;
  power: number;
  reason?: string;
}

// Interface para dados de trade
export interface TradeData {
  id: number;
  creator: string;
  partner?: string;
  amount: number;
  token: string;
  price: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: number;
  updatedAt: number;
}

// Interface para dados de recompensa
export interface RewardData {
  id: number;
  recipient: string;
  amount: number;
  reason: string;
  timestamp: number;
}

// Interface para dados de nível
export interface LevelData {
  address: string;
  level: number;
  experience: number;
  nextLevelExperience: number;
}

// Interface para dados de conquista
export interface AchievementData {
  id: number;
  recipient: string;
  name: string;
  description: string;
  image: string;
  timestamp: number;
}

// Interface para eventos do socket
export interface SocketEventMap {
  // Eventos de conexão
  [SocketEvents.CONNECT]: undefined;
  [SocketEvents.DISCONNECT]: undefined;
  [SocketEvents.CONNECT_ERROR]: Error;
  
  // Eventos de autenticação
  [SocketEvents.AUTH_SUCCESS]: { userId: string; address: string };
  [SocketEvents.AUTH_ERROR]: { message: string };
  
  // Eventos do TrustChain
  [SocketEvents.REPUTATION_UPDATE]: ReputationData;
  [SocketEvents.PROFILE_UPDATE]: ProfileData;
  [SocketEvents.VERIFICATION_STATUS]: VerificationData;
  
  // Eventos do GovGame
  [SocketEvents.PROPOSAL_CREATED]: { proposal: ProposalData };
  [SocketEvents.PROPOSAL_UPDATED]: { proposalId: number; proposal: ProposalData };
  [SocketEvents.VOTE_CAST]: { proposalId: number; vote: VoteData };
  [SocketEvents.PROPOSAL_EXECUTED]: { proposalId: number };
  [SocketEvents.PROPOSAL_CANCELLED]: { proposalId: number };
  
  // Eventos do TradeConnect
  [SocketEvents.TRADE_CREATED]: { trade: TradeData };
  [SocketEvents.TRADE_UPDATED]: { tradeId: number; trade: TradeData };
  [SocketEvents.TRADE_COMPLETED]: { tradeId: number; trade: TradeData };
  [SocketEvents.TRADE_CANCELLED]: { tradeId: number; trade: TradeData };
  
  // Eventos do EcosystemHub
  [SocketEvents.REWARD_EARNED]: { reward: RewardData };
  [SocketEvents.LEVEL_UP]: { address: string; level: number };
  [SocketEvents.ACHIEVEMENT_UNLOCKED]: { achievement: AchievementData };
}

// Interface para o socket autenticado
export interface AuthenticatedSocket {
  userId: string;
  address: string;
  emit<E extends keyof SocketEventMap>(event: E, data: SocketEventMap[E]): boolean;
  on<E extends keyof SocketEventMap>(event: E, listener: (data: SocketEventMap[E]) => void): void;
  off<E extends keyof SocketEventMap>(event: E, listener: (data: SocketEventMap[E]) => void): void;
  once<E extends keyof SocketEventMap>(event: E, listener: (data: SocketEventMap[E]) => void): void;
  join(room: string): void;
  leave(room: string): void;
  disconnect(close?: boolean): void;
}

// Interface para o gerenciador de sockets
export interface SocketManager {
  emitToUser<E extends keyof SocketEventMap>(userId: string, event: E, data: SocketEventMap[E]): void;
  emitToAddress<E extends keyof SocketEventMap>(address: string, event: E, data: SocketEventMap[E]): void;
  emitToAll<E extends keyof SocketEventMap>(event: E, data: SocketEventMap[E]): void;
  emitToOthers<E extends keyof SocketEventMap>(userId: string, event: E, data: SocketEventMap[E]): void;
  emitToRoom<E extends keyof SocketEventMap>(room: string, event: E, data: SocketEventMap[E]): void;
  addToRoom(userId: string, room: string): void;
  removeFromRoom(userId: string, room: string): void;
  getConnectedSockets(): Map<string, AuthenticatedSocket>;
  isUserConnected(userId: string): boolean;
  isAddressConnected(address: string): boolean;
  disconnectUser(userId: string): void;
  disconnectAddress(address: string): void;
}
 