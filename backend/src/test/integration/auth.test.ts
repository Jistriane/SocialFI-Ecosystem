// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import request from 'supertest';
import { app } from '../../server';
import { AuthService } from '../../services/auth.service';
import { ethers } from 'ethers';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

jest.mock('ethers', () => ({
  verifyMessage: jest.fn()
}));

describe('Auth Integration Tests', () => {
  const mockAddress = '0x123';
  const mockSignature = '0xabc';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/nonce', () => {
    it('deve gerar um nonce', async () => {
      const response = await request(app)
        .post('/api/auth/nonce')
        .send({ address: mockAddress });

      expect(response.status).toBe(200);
      expect(response.body.nonce).toBeDefined();
    });

    it('deve retornar 400 sem endereço', async () => {
      const response = await request(app)
        .post('/api/auth/nonce')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/verify', () => {
    it('deve verificar a assinatura e retornar token', async () => {
      // Gera o nonce primeiro
      const nonceResponse = await request(app)
        .post('/api/auth/nonce')
        .send({ address: mockAddress });

      (ethers.verifyMessage as jest.Mock).mockReturnValue(mockAddress);

      const response = await request(app)
        .post('/api/auth/verify')
        .send({
          address: mockAddress,
          signature: mockSignature
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });

    it('deve retornar 400 sem endereço', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({ signature: mockSignature });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('deve retornar 400 sem assinatura', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({ address: mockAddress });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('deve retornar 401 com assinatura inválida', async () => {
      // Gera o nonce primeiro
      const nonceResponse = await request(app)
        .post('/api/auth/nonce')
        .send({ address: mockAddress });

      (ethers.verifyMessage as jest.Mock).mockReturnValue('0x456');

      const response = await request(app)
        .post('/api/auth/verify')
        .send({
          address: mockAddress,
          signature: mockSignature
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });
}); 