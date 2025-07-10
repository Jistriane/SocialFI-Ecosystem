// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import { ReactNode, useEffect } from 'react'
import { useSocket, SocketEvents } from '@/hooks/useSocket'
import { useToast } from '@/components/ui/use-toast'
import { useLocale } from '@/contexts/LocaleContext'
import { useAppStore } from '@/stores/useAppStore'

interface ContractEventsProviderProps {
  children: ReactNode
}

export function ContractEventsProvider({
  children,
}: ContractEventsProviderProps) {
  const { t } = useLocale()
  const { toast } = useToast()
  const { socket, isConnected, on } = useSocket({
    onConnect: () => {
      toast({
        title: t('success'),
        description: t('socket_connected'),
      })
    },
    onDisconnect: () => {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('socket_disconnected'),
      })
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error.message,
      })
    },
  })

  const {
    updateReputation,
    updateProfile,
    updateVerificationStatus,
    addProposal,
    updateProposal,
    addVote,
    updateProposalStatus,
    addTrade,
    updateTrade,
    addReward,
    updateLevel,
    addAchievement,
  } = useAppStore()

  useEffect(() => {
    if (!socket || !isConnected) return

    // TrustChain Events
    const unsubReputationUpdate = on(
      SocketEvents.REPUTATION_UPDATE,
      (data: any) => {
        updateReputation(data.address, data.reputation)
      },
    )

    const unsubProfileUpdate = on(SocketEvents.PROFILE_UPDATE, (data: any) => {
      updateProfile(data.address, data.profile)
    })

    const unsubVerificationStatus = on(
      SocketEvents.VERIFICATION_STATUS,
      (data: any) => {
        updateVerificationStatus(data.address, data.isVerified)
      },
    )

    // GovGame Events
    const unsubProposalCreated = on(
      SocketEvents.PROPOSAL_CREATED,
      (data: any) => {
        addProposal(data.proposal)
      },
    )

    const unsubProposalUpdated = on(
      SocketEvents.PROPOSAL_UPDATED,
      (data: any) => {
        updateProposal(data.proposalId, data.proposal)
      },
    )

    const unsubVoteCast = on(SocketEvents.VOTE_CAST, (data: any) => {
      addVote(data.proposalId, data.vote)
    })

    const unsubProposalExecuted = on(
      SocketEvents.PROPOSAL_EXECUTED,
      (data: any) => {
        updateProposalStatus(data.proposalId, 'executed')
      },
    )

    const unsubProposalCancelled = on(
      SocketEvents.PROPOSAL_CANCELLED,
      (data: any) => {
        updateProposalStatus(data.proposalId, 'cancelled')
      },
    )

    // TradeConnect Events
    const unsubTradeCreated = on(SocketEvents.TRADE_CREATED, (data: any) => {
      addTrade(data.trade)
    })

    const unsubTradeUpdated = on(SocketEvents.TRADE_UPDATED, (data: any) => {
      updateTrade(data.tradeId, data.trade)
    })

    const unsubTradeCompleted = on(
      SocketEvents.TRADE_COMPLETED,
      (data: any) => {
        updateTrade(data.tradeId, { ...data.trade, status: 'completed' })
      },
    )

    const unsubTradeCancelled = on(
      SocketEvents.TRADE_CANCELLED,
      (data: any) => {
        updateTrade(data.tradeId, { ...data.trade, status: 'cancelled' })
      },
    )

    // EcosystemHub Events
    const unsubRewardEarned = on(SocketEvents.REWARD_EARNED, (data: any) => {
      addReward(data.reward)
    })

    const unsubLevelUp = on(SocketEvents.LEVEL_UP, (data: any) => {
      updateLevel(data.address, data.level)
    })

    const unsubAchievementUnlocked = on(
      SocketEvents.ACHIEVEMENT_UNLOCKED,
      (data: any) => {
        addAchievement(data.achievement)
      },
    )

    // Cleanup function
    return () => {
      unsubReputationUpdate()
      unsubProfileUpdate()
      unsubVerificationStatus()
      unsubProposalCreated()
      unsubProposalUpdated()
      unsubVoteCast()
      unsubProposalExecuted()
      unsubProposalCancelled()
      unsubTradeCreated()
      unsubTradeUpdated()
      unsubTradeCompleted()
      unsubTradeCancelled()
      unsubRewardEarned()
      unsubLevelUp()
      unsubAchievementUnlocked()
    }
  }, [
    socket,
    isConnected,
    on,
    updateReputation,
    updateProfile,
    updateVerificationStatus,
    addProposal,
    updateProposal,
    addVote,
    updateProposalStatus,
    addTrade,
    updateTrade,
    addReward,
    updateLevel,
    addAchievement,
  ])

  return <>{children}</>
}
