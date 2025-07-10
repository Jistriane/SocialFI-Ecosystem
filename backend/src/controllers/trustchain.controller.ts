// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { Request, Response } from 'express';
import { TrustChainService } from '../services/trustchain.service';
import { logger } from '../config/logger.serverless';
import { ApiResponse, Profile, LeaderboardEntry, TrustScoreEvent } from '../types/contracts';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    address: string;
  };
}

export class TrustChainController {
  private readonly trustChainService: TrustChainService;

  constructor() {
    this.trustChainService = new TrustChainService();
  }

  public getProfile = async (req: Request<{ address: string }>, res: Response): Promise<void> => {
    try {
      const { address } = req.params;

      if (!address) {
        res.status(400).json({ error: 'Endereço não fornecido.' });
        return;
      }

      const profile = await this.trustChainService.getProfile(address);
      res.json({ data: profile });
    } catch (error) {
      logger.error('Erro ao buscar perfil:', error);
      res.status(500).json({ error: 'Erro ao buscar perfil do usuário.' });
    }
  };

  public getLeaderboard = async (req: Request<never, unknown, never, { limit?: string; offset?: string }>, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit || '10', 10);
      const offset = parseInt(req.query.offset || '0', 10);

      const leaderboard = await this.trustChainService.getLeaderboard(limit, offset);
      res.json({ data: leaderboard });
    } catch (error) {
      logger.error('Erro ao buscar leaderboard:', error);
      res.status(500).json({ error: 'Erro ao buscar leaderboard.' });
    }
  };

  public endorse = async (req: Request & { user?: { address: string } }, res: Response): Promise<void> => {
    try {
      const { address: endorsedAddress } = req.body;
      const endorserAddress = req.user?.address;

      if (!endorserAddress || !endorsedAddress) {
        res.status(400).json({ error: 'Endereços não fornecidos.' });
        return;
      }

      await this.trustChainService.endorse(endorserAddress, endorsedAddress);
      res.json({ data: 'Endosso realizado com sucesso.' });
    } catch (error) {
      logger.error('Erro ao endossar usuário:', error);
      res.status(500).json({ error: 'Erro ao endossar usuário.' });
    }
  };

  public revokeEndorsement = async (req: Request & { user?: { address: string } }, res: Response): Promise<void> => {
    try {
      const { address: endorsedAddress } = req.body;
      const endorserAddress = req.user?.address;

      if (!endorserAddress || !endorsedAddress) {
        res.status(400).json({ error: 'Endereços não fornecidos.' });
        return;
      }

      await this.trustChainService.revokeEndorsement(endorserAddress, endorsedAddress);
      res.json({ data: 'Endosso revogado com sucesso.' });
    } catch (error) {
      logger.error('Erro ao revogar endosso:', error);
      res.status(500).json({ error: 'Erro ao revogar endosso.' });
    }
  };

  public getUserEndorsements = async (req: Request<{ address: string }>, res: Response): Promise<void> => {
    try {
      const { address } = req.params;

      if (!address) {
        res.status(400).json({ error: 'Endereço não fornecido.' });
        return;
      }

      const endorsements = await this.trustChainService.getUserEndorsements(address);
      res.json({ data: endorsements });
    } catch (error) {
      logger.error('Erro ao buscar endossos:', error);
      res.status(500).json({ error: 'Erro ao buscar endossos do usuário.' });
    }
  };

  public getTrustScore = async (req: Request, res: Response<ApiResponse<{ score: string }>>): Promise<void> => {
    try {
      const { address } = req.params;
      const score = await this.trustChainService.getTrustScore(address);
      res.json({ data: { score } });
    } catch (error) {
      logger.error('Erro ao obter trust score:', error);
      res.status(500).json({ error: 'Erro ao obter trust score' });
    }
  };

  public getUserBadges = async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.params;
      if (!address) {
        res.status(400).json({ error: 'Endereço não fornecido' });
        return;
      }
      const badges = await this.trustChainService.getUserBadges(address);
      res.json(badges);
    } catch (error) {
      logger.error('Erro ao obter badges:', error);
      res.status(500).json({ error: 'Erro ao obter badges' });
    }
  };

  public getRecentEvents = async (req: Request, res: Response<ApiResponse<TrustScoreEvent[]>>): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await this.trustChainService.getRecentEvents(limit);
      res.json({ data: events });
    } catch (error) {
      logger.error('Erro ao buscar eventos recentes:', error);
      res.status(500).json({ error: 'Erro ao buscar eventos recentes' });
    }
  };
} 