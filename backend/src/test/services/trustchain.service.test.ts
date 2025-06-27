// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { Contract } from 'ethers';
import { TrustChainService } from '../../services/trustchain.service';
import { config } from '../../config';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock do ethers
const mockContract = {
  getProfile: jest.fn(),
  getTrustScore: jest.fn(),
  getLeaderboard: jest.fn(),
  endorse: jest.fn(),
  revokeEndorsement: jest.fn(),
  getUserEndorsements: jest.fn(),
  connect: jest.fn(),
  filters: {
    TrustScoreUpdated: jest.fn().mockReturnValue({})
  },
  queryFilter: jest.fn()
};

const mockProvider = {
  getSigner: jest.fn().mockResolvedValue({})
};

jest.mock('ethers', () => ({
  Contract: jest.fn(() => mockContract),
  JsonRpcProvider: jest.fn(() => mockProvider)
}));

describe('TrustChainService', () => {
  const mockAddress = '0x123';
  let trustChainService: TrustChainService;

  beforeEach(() => {
    jest.clearAllMocks();
    trustChainService = new TrustChainService();
  });

  describe('getProfile', () => {
    it('deve retornar o perfil do usuário', async () => {
      const mockProfile = ['85', '10', ['badge1', 'badge2']];
      mockContract.getProfile.mockResolvedValue(mockProfile);

      const result = await trustChainService.getProfile(mockAddress);

      expect(result).toEqual({
        address: mockAddress,
        score: '85',
        endorsements: '10',
        badges: ['badge1', 'badge2']
      });
    });

    it('deve lançar erro se falhar', async () => {
      mockContract.getProfile.mockRejectedValue(new Error('Erro de contrato'));
      await expect(trustChainService.getProfile(mockAddress)).rejects.toThrow('Erro ao buscar perfil do usuário');
    });
  });

  describe('getTrustScore', () => {
    it('deve retornar o trust score', async () => {
      const mockScore = '85';
      mockContract.getTrustScore.mockResolvedValue(mockScore);

      const result = await trustChainService.getTrustScore(mockAddress);
      expect(result).toBe(mockScore);
    });

    it('deve lançar erro se falhar', async () => {
      mockContract.getTrustScore.mockRejectedValue(new Error('Erro de contrato'));
      await expect(trustChainService.getTrustScore(mockAddress)).rejects.toThrow('Erro ao buscar trust score');
    });
  });

  describe('getLeaderboard', () => {
    it('deve retornar o leaderboard', async () => {
      const mockAddresses = ['0x123', '0x456'];
      const mockScores = ['85', '75'];
      mockContract.getLeaderboard.mockResolvedValue([mockAddresses, mockScores]);

      const result = await trustChainService.getLeaderboard(2, 0);
      expect(result).toEqual([
        { address: '0x123', score: '85' },
        { address: '0x456', score: '75' }
      ]);
    });

    it('deve lançar erro se falhar', async () => {
      mockContract.getLeaderboard.mockRejectedValue(new Error('Erro de contrato'));
      await expect(trustChainService.getLeaderboard()).rejects.toThrow('Erro ao buscar leaderboard');
    });
  });

  describe('endorse', () => {
    it('deve endossar um usuário com sucesso', async () => {
      const mockTx = { wait: jest.fn().mockResolvedValue({}) };
      const mockContractWithSigner = { endorse: jest.fn().mockResolvedValue(mockTx) };
      mockContract.connect.mockReturnValue(mockContractWithSigner);
      mockProvider.getSigner.mockResolvedValue({});

      await trustChainService.endorse(mockAddress, '0x456');
      
      expect(mockProvider.getSigner).toHaveBeenCalledWith(mockAddress);
      expect(mockContract.connect).toHaveBeenCalled();
      expect(mockContractWithSigner.endorse).toHaveBeenCalledWith('0x456');
      expect(mockTx.wait).toHaveBeenCalled();
    });

    it('deve lançar erro se falhar', async () => {
      mockProvider.getSigner.mockRejectedValue(new Error('Erro de contrato'));
      await expect(trustChainService.endorse(mockAddress, '0x456')).rejects.toThrow('Erro ao endossar usuário');
    });
  });

  describe('revokeEndorsement', () => {
    it('deve revogar um endosso com sucesso', async () => {
      const mockTx = { wait: jest.fn().mockResolvedValue({}) };
      const mockContractWithSigner = { revokeEndorsement: jest.fn().mockResolvedValue(mockTx) };
      mockContract.connect.mockReturnValue(mockContractWithSigner);
      mockProvider.getSigner.mockResolvedValue({});

      await trustChainService.revokeEndorsement(mockAddress, '0x456');
      
      expect(mockProvider.getSigner).toHaveBeenCalledWith(mockAddress);
      expect(mockContract.connect).toHaveBeenCalled();
      expect(mockContractWithSigner.revokeEndorsement).toHaveBeenCalledWith('0x456');
      expect(mockTx.wait).toHaveBeenCalled();
    });

    it('deve lançar erro se falhar', async () => {
      mockProvider.getSigner.mockRejectedValue(new Error('Erro de contrato'));
      await expect(trustChainService.revokeEndorsement(mockAddress, '0x456')).rejects.toThrow('Erro ao revogar endosso');
    });
  });

  describe('getUserEndorsements', () => {
    it('deve retornar os endossos do usuário', async () => {
      const mockEndorsements = ['0x123', '0x456'];
      mockContract.getUserEndorsements.mockResolvedValue(mockEndorsements);

      const result = await trustChainService.getUserEndorsements(mockAddress);
      expect(result).toEqual(mockEndorsements);
    });

    it('deve lançar erro se falhar', async () => {
      mockContract.getUserEndorsements.mockRejectedValue(new Error('Erro de contrato'));
      await expect(trustChainService.getUserEndorsements(mockAddress)).rejects.toThrow('Erro ao buscar endossos do usuário');
    });
  });

  describe('getRecentEvents', () => {
    it('deve retornar eventos recentes', async () => {
      const mockEvents = [
        { args: { user: '0x123', score: '85' } },
        { args: { user: '0x456', score: '75' } }
      ];
      mockContract.filters.TrustScoreUpdated.mockReturnValue({
        getTopicFilter: jest.fn(),
        fragment: {}
      });
      mockContract.queryFilter.mockResolvedValue(mockEvents.map(event => ({
        ...event,
        interface: {},
        fragment: {},
        eventName: 'TrustScoreUpdated',
        eventSignature: 'TrustScoreUpdated(address,string)',
        blockNumber: 1,
        blockHash: '0x123',
        transactionIndex: 0,
        removed: false,
        address: '0x123',
        data: '0x',
        topics: [],
        transactionHash: '0x123',
        logIndex: 0
      })));

      const result = await trustChainService.getRecentEvents(2);
      expect(result).toEqual([
        { user: '0x123', score: '85' },
        { user: '0x456', score: '75' }
      ]);
    });

    it('deve lançar erro se falhar', async () => {
      mockContract.queryFilter.mockRejectedValue(new Error('Erro de contrato'));
      await expect(trustChainService.getRecentEvents()).rejects.toThrow('Erro ao buscar eventos recentes');
    });
  });
}); 