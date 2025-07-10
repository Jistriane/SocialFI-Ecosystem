// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { render, act } from '@testing-library/react'
import { ContractEventsProvider } from './ContractEventsProvider'
import { useSocket, SocketEvents } from '@/hooks/useSocket'
import { useToast } from '@/components/ui/use-toast'
import { useLocale } from '@/contexts/LocaleContext'
import { useAppStore } from '@/stores/useAppStore'

// Mock das dependências
jest.mock('@/hooks/useSocket', () => ({
  useSocket: jest.fn(),
  SocketEvents: {
    REPUTATION_UPDATE: 'trustchain:reputation_update',
    PROFILE_UPDATE: 'trustchain:profile_update',
    VERIFICATION_STATUS: 'trustchain:verification_status',
    PROPOSAL_CREATED: 'govgame:proposal_created',
    PROPOSAL_UPDATED: 'govgame:proposal_updated',
    VOTE_CAST: 'govgame:vote_cast',
    PROPOSAL_EXECUTED: 'govgame:proposal_executed',
    PROPOSAL_CANCELLED: 'govgame:proposal_cancelled',
    TRADE_CREATED: 'tradeconnect:trade_created',
    TRADE_UPDATED: 'tradeconnect:trade_updated',
    TRADE_COMPLETED: 'tradeconnect:trade_completed',
    TRADE_CANCELLED: 'tradeconnect:trade_cancelled',
    REWARD_EARNED: 'ecosystem:reward_earned',
    LEVEL_UP: 'ecosystem:level_up',
    ACHIEVEMENT_UNLOCKED: 'ecosystem:achievement_unlocked',
  },
}))

jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}))

jest.mock('@/contexts/LocaleContext', () => ({
  useLocale: jest.fn(),
}))

jest.mock('@/stores/useAppStore', () => ({
  useAppStore: jest.fn(),
}))

describe('ContractEventsProvider', () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
  }

  const mockOn = jest.fn((event, callback) => {
    return () => mockSocket.off(event, callback)
  })

  const mockToast = jest.fn()
  const mockTranslate = jest.fn((key) => key)

  const mockStoreActions = {
    updateReputation: jest.fn(),
    updateProfile: jest.fn(),
    updateVerificationStatus: jest.fn(),
    addProposal: jest.fn(),
    updateProposal: jest.fn(),
    addVote: jest.fn(),
    updateProposalStatus: jest.fn(),
    addTrade: jest.fn(),
    updateTrade: jest.fn(),
    addReward: jest.fn(),
    updateLevel: jest.fn(),
    addAchievement: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSocket as jest.Mock).mockReturnValue({
      socket: mockSocket,
      isConnected: true,
      on: mockOn,
    })
    ;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })
    ;(useLocale as jest.Mock).mockReturnValue({ t: mockTranslate })
    ;(useAppStore as unknown as jest.Mock).mockReturnValue(mockStoreActions)
  })

  it('deve renderizar children corretamente', () => {
    const { getByText } = render(
      <ContractEventsProvider>
        <div>Test Child</div>
      </ContractEventsProvider>,
    )
    expect(getByText('Test Child')).toBeInTheDocument()
  })

  it('deve registrar todos os event listeners quando conectado', () => {
    render(
      <ContractEventsProvider>
        <div>Test</div>
      </ContractEventsProvider>,
    )

    // Verificar se todos os eventos foram registrados
    expect(mockOn).toHaveBeenCalledWith(
      SocketEvents.REPUTATION_UPDATE,
      expect.any(Function),
    )
    expect(mockOn).toHaveBeenCalledWith(
      SocketEvents.PROFILE_UPDATE,
      expect.any(Function),
    )
    expect(mockOn).toHaveBeenCalledWith(
      SocketEvents.VERIFICATION_STATUS,
      expect.any(Function),
    )
    expect(mockOn).toHaveBeenCalledWith(
      SocketEvents.PROPOSAL_CREATED,
      expect.any(Function),
    )
    expect(mockOn).toHaveBeenCalledWith(
      SocketEvents.PROPOSAL_UPDATED,
      expect.any(Function),
    )
    expect(mockOn).toHaveBeenCalledWith(
      SocketEvents.VOTE_CAST,
      expect.any(Function),
    )
    expect(mockOn).toHaveBeenCalledWith(
      SocketEvents.PROPOSAL_EXECUTED,
      expect.any(Function),
    )
    expect(mockOn).toHaveBeenCalledWith(
      SocketEvents.PROPOSAL_CANCELLED,
      expect.any(Function),
    )
    expect(mockOn).toHaveBeenCalledWith(
      SocketEvents.TRADE_CREATED,
      expect.any(Function),
    )
    expect(mockOn).toHaveBeenCalledWith(
      SocketEvents.TRADE_UPDATED,
      expect.any(Function),
    )
    expect(mockOn).toHaveBeenCalledWith(
      SocketEvents.TRADE_COMPLETED,
      expect.any(Function),
    )
    expect(mockOn).toHaveBeenCalledWith(
      SocketEvents.TRADE_CANCELLED,
      expect.any(Function),
    )
    expect(mockOn).toHaveBeenCalledWith(
      SocketEvents.REWARD_EARNED,
      expect.any(Function),
    )
    expect(mockOn).toHaveBeenCalledWith(
      SocketEvents.LEVEL_UP,
      expect.any(Function),
    )
    expect(mockOn).toHaveBeenCalledWith(
      SocketEvents.ACHIEVEMENT_UNLOCKED,
      expect.any(Function),
    )
  })

  it('deve atualizar reputação quando receber evento REPUTATION_UPDATE', () => {
    render(
      <ContractEventsProvider>
        <div>Test</div>
      </ContractEventsProvider>,
    )

    const reputationHandler = mockOn.mock.calls.find(
      ([event]) => event === SocketEvents.REPUTATION_UPDATE,
    )?.[1]

    if (reputationHandler) {
      reputationHandler({ address: '0x123', newScore: 100 })
    }

    expect(mockStoreActions.updateReputation).toHaveBeenCalledWith('0x123', 100)
  })

  it('deve atualizar perfil quando receber evento PROFILE_UPDATE', () => {
    render(
      <ContractEventsProvider>
        <div>Test</div>
      </ContractEventsProvider>,
    )

    const profileHandler = mockOn.mock.calls.find(
      ([event]) => event === SocketEvents.PROFILE_UPDATE,
    )?.[1]

    if (profileHandler) {
      profileHandler({ address: '0x123', profile: { username: 'test' } })
    }

    expect(mockStoreActions.updateProfile).toHaveBeenCalledWith('0x123', {
      username: 'test',
    })
  })

  it('deve atualizar status de verificação quando receber evento VERIFICATION_STATUS', () => {
    render(
      <ContractEventsProvider>
        <div>Test</div>
      </ContractEventsProvider>,
    )

    const verificationHandler = mockOn.mock.calls.find(
      ([event]) => event === SocketEvents.VERIFICATION_STATUS,
    )?.[1]

    if (verificationHandler) {
      verificationHandler({ address: '0x123', isVerified: true })
    }

    expect(mockStoreActions.updateVerificationStatus).toHaveBeenCalledWith(
      '0x123',
      true,
    )
  })

  it('deve adicionar proposta quando receber evento PROPOSAL_CREATED', () => {
    render(
      <ContractEventsProvider>
        <div>Test</div>
      </ContractEventsProvider>,
    )

    const proposalHandler = mockOn.mock.calls.find(
      ([event]) => event === SocketEvents.PROPOSAL_CREATED,
    )?.[1]

    if (proposalHandler) {
      proposalHandler({ id: 1, title: 'Test Proposal' })
    }

    expect(mockStoreActions.addProposal).toHaveBeenCalledWith({
      id: 1,
      title: 'Test Proposal',
    })
  })

  it('deve atualizar proposta quando receber evento PROPOSAL_UPDATED', () => {
    render(
      <ContractEventsProvider>
        <div>Test</div>
      </ContractEventsProvider>,
    )

    const proposalUpdateHandler = mockOn.mock.calls.find(
      ([event]) => event === SocketEvents.PROPOSAL_UPDATED,
    )?.[1]

    if (proposalUpdateHandler) {
      proposalUpdateHandler({ id: 1, status: 'updated' })
    }

    expect(mockStoreActions.updateProposal).toHaveBeenCalledWith(1, {
      id: 1,
      status: 'updated',
    })
  })

  it('deve adicionar voto quando receber evento VOTE_CAST', () => {
    render(
      <ContractEventsProvider>
        <div>Test</div>
      </ContractEventsProvider>,
    )

    const voteHandler = mockOn.mock.calls.find(
      ([event]) => event === SocketEvents.VOTE_CAST,
    )?.[1]

    if (voteHandler) {
      voteHandler({ proposalId: 1, voter: '0x123' })
    }

    expect(mockStoreActions.addVote).toHaveBeenCalledWith(1, {
      proposalId: 1,
      voter: '0x123',
    })
  })

  it('deve atualizar status da proposta quando receber eventos de execução ou cancelamento', () => {
    render(
      <ContractEventsProvider>
        <div>Test</div>
      </ContractEventsProvider>,
    )

    const executedHandler = mockOn.mock.calls.find(
      ([event]) => event === SocketEvents.PROPOSAL_EXECUTED,
    )?.[1]

    const cancelledHandler = mockOn.mock.calls.find(
      ([event]) => event === SocketEvents.PROPOSAL_CANCELLED,
    )?.[1]

    if (executedHandler) {
      executedHandler({ id: 1 })
    }
    if (cancelledHandler) {
      cancelledHandler({ id: 1 })
    }

    expect(mockStoreActions.updateProposalStatus).toHaveBeenCalledWith(
      1,
      'executed',
    )
    expect(mockStoreActions.updateProposalStatus).toHaveBeenCalledWith(
      1,
      'cancelled',
    )
  })

  it('deve gerenciar trades corretamente', () => {
    render(
      <ContractEventsProvider>
        <div>Test</div>
      </ContractEventsProvider>,
    )

    const createdHandler = mockOn.mock.calls.find(
      ([event]) => event === SocketEvents.TRADE_CREATED,
    )?.[1]

    const updatedHandler = mockOn.mock.calls.find(
      ([event]) => event === SocketEvents.TRADE_UPDATED,
    )?.[1]

    const completedHandler = mockOn.mock.calls.find(
      ([event]) => event === SocketEvents.TRADE_COMPLETED,
    )?.[1]

    const cancelledHandler = mockOn.mock.calls.find(
      ([event]) => event === SocketEvents.TRADE_CANCELLED,
    )?.[1]

    if (createdHandler) createdHandler({ id: 1 })
    if (updatedHandler) updatedHandler({ id: 1 })
    if (completedHandler) completedHandler({ id: 1 })
    if (cancelledHandler) cancelledHandler({ id: 1 })

    expect(mockStoreActions.addTrade).toHaveBeenCalledWith({ id: 1 })
    expect(mockStoreActions.updateTrade).toHaveBeenCalledWith(1, { id: 1 })
    expect(mockStoreActions.updateTrade).toHaveBeenCalledWith(1, {
      id: 1,
      status: 'completed',
    })
    expect(mockStoreActions.updateTrade).toHaveBeenCalledWith(1, {
      id: 1,
      status: 'cancelled',
    })
  })

  it('deve gerenciar recompensas e conquistas corretamente', () => {
    render(
      <ContractEventsProvider>
        <div>Test</div>
      </ContractEventsProvider>,
    )

    const rewardHandler = mockOn.mock.calls.find(
      ([event]) => event === SocketEvents.REWARD_EARNED,
    )?.[1]

    const levelHandler = mockOn.mock.calls.find(
      ([event]) => event === SocketEvents.LEVEL_UP,
    )?.[1]

    const achievementHandler = mockOn.mock.calls.find(
      ([event]) => event === SocketEvents.ACHIEVEMENT_UNLOCKED,
    )?.[1]

    if (rewardHandler) rewardHandler({ amount: 100 })
    if (levelHandler) levelHandler({ level: 2 })
    if (achievementHandler) achievementHandler({ achievement: 'test' })

    expect(mockStoreActions.addReward).toHaveBeenCalledWith({ amount: 100 })
    expect(mockStoreActions.updateLevel).toHaveBeenCalledWith('0x123', 2)
    expect(mockStoreActions.addAchievement).toHaveBeenCalledWith({
      achievement: 'test',
    })
  })
})
