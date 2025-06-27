// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../types/contracts';
import { logger } from '../config/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    address: string;
  };
}

export class AuthController {
  private readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public getNonce = async (req: Request<never, unknown, AuthRequest>, res: Response): Promise<void> => {
    try {
      const { address } = req.body;

      if (!address) {
        res.status(400).json({ error: 'Endereço não fornecido.' });
        return;
      }

      const nonce = this.authService.generateNonce(address);
      res.json({ nonce });
    } catch (error) {
      logger.error('Erro ao gerar nonce:', error);
      res.status(500).json({ error: 'Erro ao gerar nonce.' });
    }
  };

  public verifySignature = async (req: Request<never, unknown, AuthRequest>, res: Response): Promise<void> => {
    try {
      const { address, signature } = req.body;

      if (!address || !signature) {
        res.status(400).json({ error: 'Endereço e assinatura são obrigatórios.' });
        return;
      }

      const result = await this.authService.verifySignature(address, signature);
      
      if (result.error) {
        res.status(401).json({ error: result.error });
        return;
      }

      res.json({ token: result.token });
    } catch (error) {
      logger.error('Erro ao verificar assinatura:', error);
      res.status(500).json({ error: 'Erro ao verificar assinatura.' });
    }
  };

  public getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { address } = req.user || {};
      if (!address) {
        res.status(401).json({ error: 'Não autorizado' });
        return;
      }
      
      const profile = await this.authService.getProfile(address);
      res.json(profile);
    } catch (error: any) {
      logger.error('Erro ao buscar perfil:', error);
      
      if (error.message === 'Usuário não encontrado') {
        res.status(404).json({ error: error.message });
        return;
      }
      
      res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
  };

  public logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        res.status(401).json({ error: 'Token não fornecido' });
        return;
      }
      
      const result = await this.authService.logout(token);
      if (result.success) {
        res.json({ message: 'Logout realizado com sucesso' });
      } else {
        res.status(500).json({ error: result.message || 'Erro ao realizar logout' });
      }
    } catch (error: any) {
      logger.error('Erro ao realizar logout:', error);
      res.status(500).json({ error: error.message || 'Erro ao realizar logout' });
    }
  };
} 