// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { ethers, Contract } from 'ethers';
import { profiles } from '../storage';
import { logger } from '../config/logger';
import { config } from '../config';
import type { Profile, LeaderboardEntry, TrustScoreEvent, EndorsementEvent } from '../types/contracts';

// Serviço TrustChain
export class TrustChainService {
  private readonly provider: ethers.JsonRpcProvider;
  private readonly contract: Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      `https://eth-sepolia.g.alchemy.com/v2/${config.alchemyApiKey}`
    );
    
    this.contract = new ethers.Contract(
      config.contracts.trustChainAddress,
      ['function getProfile(address) view returns (tuple(string score, string endorsements, string[] badges))',
       'function getTrustScore(address) view returns (string)',
       'function getLeaderboard(uint256, uint256) view returns (address[], string[])',
       'function endorse(address) returns (bool)',
       'function revokeEndorsement(address) returns (bool)',
       'function getUserEndorsements(address) view returns (address[])',
       'event TrustScoreUpdated(address indexed user, string score)',
       'event EndorsementUpdated(address indexed endorser, address indexed endorsed, bool action)'],
      this.provider
    );
  }

  /**
   * Cria ou atualiza um perfil
   * @param address Endereço da carteira
   * @param data Dados do perfil
   */
  async updateProfile(address: string, data: Partial<any>) {
    try {
      const profile = profiles.find(p => p.address.toLowerCase() === address.toLowerCase());

      if (profile) {
        profiles.update(
          p => p.address.toLowerCase() === address.toLowerCase(),
          data
        );
      } else {
        profiles.add({
          address,
          name: data.name || '',
          bio: data.bio || '',
          avatar: data.avatar || '',
          social: data.social || {}
        });
      }

      return true;
    } catch (error) {
      logger.error('Erro ao atualizar perfil:', error);
      return false;
    }
  }

  /**
   * Obtém um perfil
   * @param address Endereço da carteira
   */
  public async getProfile(address: string): Promise<Profile> {
    try {
      const result = await this.contract.getProfile(address);
      return {
        address,
        score: result[0],
        endorsements: result[1],
        badges: result[2]
      };
    } catch (error) {
      logger.error('Erro ao buscar perfil:', error);
      throw new Error('Erro ao buscar perfil do usuário.');
    }
  }

  /**
   * Lista todos os perfis
   */
  async listProfiles() {
    return profiles.getAll();
  }

  /**
   * Obtém o trust score de um usuário
   * @param address Endereço da carteira
   */
  public async getTrustScore(address: string): Promise<string> {
    try {
      return await this.contract.getTrustScore(address);
    } catch (error) {
      logger.error('Erro ao obter trust score:', error);
      throw new Error('Erro ao buscar trust score');
    }
  }

  /**
   * Obtém eventos recentes
   * @param limit Limite de eventos
   */
  public async getRecentEvents(limit = 10): Promise<TrustScoreEvent[]> {
    try {
      const filter = this.contract.filters.TrustScoreUpdated();
      const events = await this.contract.queryFilter(filter, -limit, 'latest');
      
      return events.map(event => ({
        user: (event as any).args?.user || '',
        score: (event as any).args?.score || '',
        blockNumber: event.blockNumber || 0,
        transactionHash: event.transactionHash || ''
      }));
    } catch (error) {
      logger.error('Erro ao buscar eventos recentes:', error);
      throw new Error('Erro ao buscar eventos recentes');
    }
  }

  public async getLeaderboard(limit: number = 10, offset: number = 0): Promise<LeaderboardEntry[]> {
    try {
      const [addresses, scores] = await this.contract.getLeaderboard(limit, offset);
      return addresses.map((address: string, index: number) => ({
        address,
        score: scores[index]
      }));
    } catch (error) {
      logger.error('Erro ao buscar leaderboard:', error);
      throw new Error('Erro ao buscar leaderboard.');
    }
  }

  public async endorse(endorserAddress: string, endorsedAddress: string): Promise<void> {
    try {
      const signer = await this.provider.getSigner(endorserAddress);
      const contractWithSigner = this.contract.connect(signer);
      const tx = await (contractWithSigner as any).endorse(endorsedAddress);
      await tx.wait();
    } catch (error) {
      logger.error('Erro ao endossar usuário:', error);
      throw new Error('Erro ao endossar usuário.');
    }
  }

  public async revokeEndorsement(endorserAddress: string, endorsedAddress: string): Promise<void> {
    try {
      const signer = await this.provider.getSigner(endorserAddress);
      const contractWithSigner = this.contract.connect(signer);
      const tx = await (contractWithSigner as any).revokeEndorsement(endorsedAddress);
      await tx.wait();
    } catch (error) {
      logger.error('Erro ao revogar endosso:', error);
      throw new Error('Erro ao revogar endosso.');
    }
  }

  public async getUserEndorsements(address: string): Promise<string[]> {
    try {
      return await this.contract.getUserEndorsements(address);
    } catch (error) {
      logger.error('Erro ao buscar endossos do usuário:', error);
      throw new Error('Erro ao buscar endossos do usuário.');
    }
  }

  public async getUserBadges(address: string): Promise<string[]> {
    try {
      return await this.contract.getUserBadges(address);
    } catch (error) {
      logger.error('Erro ao buscar badges do usuário:', error);
      throw new Error('Erro ao buscar badges do usuário.');
    }
  }

  public async listenToTrustScoreUpdates(callback: (event: TrustScoreEvent) => void): Promise<void> {
    try {
      this.contract.on('TrustScoreUpdated', (user: string, score: string, event: any) => {
        callback({
          user,
          score,
          blockNumber: event.blockNumber || 0,
          transactionHash: event.transactionHash || ''
        });
      });
    } catch (error) {
      logger.error('Erro ao escutar eventos de trust score:', error);
      throw new Error('Erro ao escutar eventos de trust score.');
    }
  }

  public async listenToEndorsementUpdates(callback: (event: EndorsementEvent) => void): Promise<void> {
    try {
      this.contract.on('EndorsementUpdated', (endorser: string, endorsed: string, action: boolean, event: any) => {
        callback({
          endorser,
          endorsed,
          action: action ? 'endorse' : 'revoke',
          blockNumber: event.blockNumber || 0,
          transactionHash: event.transactionHash || ''
        });
      });
    } catch (error) {
      logger.error('Erro ao escutar eventos de endosso:', error);
      throw new Error('Erro ao escutar eventos de endosso.');
    }
  }

  public stopListening(): void {
    this.contract.removeAllListeners();
  }
}
