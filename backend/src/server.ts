// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import express from 'express';
import cors from 'cors';
import { config } from './config';
import { logger } from './config/logger.serverless';
import { errorHandler } from './middlewares/errorHandler';
import { setupWebSocket } from './config/socket';
import { authRoutes } from './routes/auth.routes';
import { trustchainRoutes } from './routes/trustchain.routes';

const app = express();

// Middlewares
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/trustchain', trustchainRoutes);

// Health check
app.get('/health', (_, res) => res.send('OK'));

// Error handler
app.use(errorHandler);

const server = app.listen(config.port, () => {
  logger.info(`Servidor rodando na porta ${config.port}`);
});

setupWebSocket(server);

export { app, server }; 