// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type Language = 'pt-BR' | 'en'
type Theme = 'light' | 'dark' | 'system'

interface Profile {
  name?: string
  bio?: string
  avatar?: string
  social?: {
    twitter?: string
    github?: string
    discord?: string
  }
}

interface Proposal {
  id: string
  title: string
  description: string
  status: 'active' | 'executed' | 'cancelled'
  votes: number
  endTime: number
}

interface Trade {
  id: string
  title: string
  description: string
  status: 'active' | 'completed' | 'cancelled'
  amount: string
  creator: string
}

interface Reward {
  id: string
  type: string
  amount: number
  description: string
  timestamp: number
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  timestamp: number
}

interface AppState {
  language: Language
  theme: Theme
  isWalletConnected: boolean
  address: string | null
  
  // Profile data
  profiles: Record<string, Profile>
  reputations: Record<string, number>
  verificationStatus: Record<string, boolean>
  
  // GovGame data
  proposals: Proposal[]
  votes: Record<string, any[]>
  
  // TradeConnect data
  trades: Trade[]
  
  // EcosystemHub data
  rewards: Reward[]
  levels: Record<string, number>
  achievements: Achievement[]
  
  // Basic setters
  setLanguage: (language: Language) => void
  setTheme: (theme: Theme) => void
  setWalletConnected: (isConnected: boolean) => void
  setAddress: (address: string | null) => void
  
  // Profile methods
  updateReputation: (address: string, reputation: number) => void
  updateProfile: (address: string, profile: Profile) => void
  updateVerificationStatus: (address: string, isVerified: boolean) => void
  
  // GovGame methods
  addProposal: (proposal: Proposal) => void
  updateProposal: (proposalId: string, proposal: Partial<Proposal>) => void
  addVote: (proposalId: string, vote: any) => void
  updateProposalStatus: (proposalId: string, status: 'active' | 'executed' | 'cancelled') => void
  
  // TradeConnect methods
  addTrade: (trade: Trade) => void
  updateTrade: (tradeId: string, trade: Partial<Trade>) => void
  
  // EcosystemHub methods
  addReward: (reward: Reward) => void
  updateLevel: (address: string, level: number) => void
  addAchievement: (achievement: Achievement) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Basic state
      language: 'pt-BR',
      theme: 'system',
      isWalletConnected: false,
      address: null,
      
      // Data collections
      profiles: {},
      reputations: {},
      verificationStatus: {},
      proposals: [],
      votes: {},
      trades: [],
      rewards: [],
      levels: {},
      achievements: [],
      
      // Basic setters
      setLanguage: (language) => {
        console.log('AppStore setLanguage called with:', language)
        set({ language })
      },
      setTheme: (theme) => set({ theme }),
      setWalletConnected: (isConnected) => set({ isWalletConnected: isConnected }),
      setAddress: (address) => set({ address }),
      
      // Profile methods
      updateReputation: (address, reputation) =>
        set((state) => ({
          reputations: { ...state.reputations, [address]: reputation }
        })),
      
      updateProfile: (address, profile) =>
        set((state) => ({
          profiles: { ...state.profiles, [address]: profile }
        })),
      
      updateVerificationStatus: (address, isVerified) =>
        set((state) => ({
          verificationStatus: { ...state.verificationStatus, [address]: isVerified }
        })),
      
      // GovGame methods
      addProposal: (proposal) =>
        set((state) => ({
          proposals: [...state.proposals, proposal]
        })),
      
      updateProposal: (proposalId, proposalUpdate) =>
        set((state) => ({
          proposals: state.proposals.map(p =>
            p.id === proposalId ? { ...p, ...proposalUpdate } : p
          )
        })),
      
      addVote: (proposalId, vote) =>
        set((state) => ({
          votes: {
            ...state.votes,
            [proposalId]: [...(state.votes[proposalId] || []), vote]
          }
        })),
      
      updateProposalStatus: (proposalId, status) =>
        set((state) => ({
          proposals: state.proposals.map(p =>
            p.id === proposalId ? { ...p, status } : p
          )
        })),
      
      // TradeConnect methods
      addTrade: (trade) =>
        set((state) => ({
          trades: [...state.trades, trade]
        })),
      
      updateTrade: (tradeId, tradeUpdate) =>
        set((state) => ({
          trades: state.trades.map(t =>
            t.id === tradeId ? { ...t, ...tradeUpdate } : t
          )
        })),
      
      // EcosystemHub methods
      addReward: (reward) =>
        set((state) => ({
          rewards: [...state.rewards, reward]
        })),
      
      updateLevel: (address, level) =>
        set((state) => ({
          levels: { ...state.levels, [address]: level }
        })),
      
      addAchievement: (achievement) =>
        set((state) => ({
          achievements: [...state.achievements, achievement]
        })),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        language: state.language,
        theme: state.theme,
        profiles: state.profiles,
        reputations: state.reputations,
        verificationStatus: state.verificationStatus,
      }),
    }
  )
) 