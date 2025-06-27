// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { BaseContract, ContractEvent, ContractEventPayload, ContractMethod } from 'ethers';

// Tipos de resposta da API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Tipos do TrustChain
export interface TrustChainProfile {
  score: string;
  endorsements: string;
  badges: string[];
}

export interface Profile extends TrustChainProfile {
  address: string;
}

export interface LeaderboardEntry {
  address: string;
  score: string;
}

export interface TrustScoreEvent {
  user: string;
  score: string;
  blockNumber: number;
  transactionHash: string;
}

export interface EndorsementEvent {
  endorser: string;
  endorsed: string;
  action: 'endorse' | 'revoke';
  blockNumber: number;
  transactionHash: string;
}

// Tipos de Autenticação
export interface AuthRequest {
  address: string;
  signature?: string;
}

export interface AuthResponse {
  token?: string;
  nonce?: string;
  error?: string;
}

// Tipos do Contrato
export interface TrustChainContract extends BaseContract {
  getProfile: ContractMethod<[string], TrustChainProfile>;
  getTrustScore: ContractMethod<[string], string>;
  getLeaderboard: ContractMethod<[number, number], [string[], string[]]>;
  endorse: ContractMethod<[string], ContractEventPayload>;
  revokeEndorsement: ContractMethod<[string], ContractEventPayload>;
  getUserEndorsements: ContractMethod<[string], string[]>;
  filters: {
    TrustScoreUpdated: ContractEvent<[string, string]>;
    EndorsementUpdated: ContractEvent<[string, string, boolean]>;
  };
} 