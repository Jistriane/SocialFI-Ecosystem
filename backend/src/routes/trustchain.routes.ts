// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { Router } from 'express';
import { TrustChainController } from '../controllers/trustchain.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const trustChainController = new TrustChainController();

// Rotas públicas
router.get('/profile/:address', trustChainController.getProfile);
router.get('/leaderboard', trustChainController.getLeaderboard);
router.get('/endorsements/:address', trustChainController.getUserEndorsements);
router.get('/trust-score/:address', trustChainController.getTrustScore);
router.get('/badges/:address', trustChainController.getUserBadges);
router.get('/events', trustChainController.getRecentEvents);

// Rotas protegidas
router.post('/endorse', authMiddleware, trustChainController.endorse);
router.post('/revoke', authMiddleware, trustChainController.revokeEndorsement);

export const trustChainRouter = router;
// Alias para compatibilidade
export const trustchainRoutes = trustChainRouter; 