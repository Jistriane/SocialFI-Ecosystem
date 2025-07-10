// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import { errorHandler } from '../../src/middlewares/errorHandler';
import { authRoutes } from '../../src/routes/auth.routes';
import { trustchainRoutes } from '../../src/routes/trustchain.routes';

const app = express();

// Middlewares
app.use(cors({
  origin: ['https://frontend-nbayoxu23-jistrianes-projects.vercel.app', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Rotas
app.use('/auth', authRoutes);
app.use('/trustchain', trustchainRoutes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// Error handler
app.use(errorHandler);

// Configuração para Netlify Functions
const handler = serverless(app);

export { handler }; 