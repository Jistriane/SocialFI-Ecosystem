// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { WalletConnect } from './WalletConnect/index'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useLocale } from '@/contexts/LocaleContext'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  Home,
  Shield,
  TrendingUp,
  Vote,
  User,
  Settings,
  Menu,
  X,
  Globe,
} from 'lucide-react'
import { useState } from 'react'
import { useNetwork, useSwitchNetwork } from 'wagmi'

const navigation = [
  { name: 'home', href: '/' as const, icon: Home },
  { name: 'trustchain', href: '/trustchain' as const, icon: Shield },
  { name: 'tradeconnect', href: '/tradeconnect' as const, icon: TrendingUp },
  { name: 'govgame', href: '/govgame' as const, icon: Vote },
  { name: 'profile', href: '/profile' as const, icon: User },
  { name: 'settings', href: '/settings' as const, icon: Settings },
]

const NETWORKS = [
  {
    id: 11155111,
    name: 'Ethereum Sepolia',
    symbol: 'ETH',
    color: 'bg-blue-500',
  },
  {
    id: 133717,
    name: 'Metis Sepolia',
    symbol: 'tMETIS',
    color: 'bg-green-500',
  },
]

function NetworkSelectorCompact() {
  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()

  const currentNetwork = NETWORKS.find((n) => n.id === chain?.id)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-blue-200 text-blue-100 hover:bg-blue-700"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              currentNetwork?.color || 'bg-gray-400'
            }`}
          />
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentNetwork?.symbol || 'Rede'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {NETWORKS.map((network) => (
          <DropdownMenuItem
            key={network.id}
            onClick={() => switchNetwork?.(network.id)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className={`w-3 h-3 rounded-full ${network.color}`} />
            <div className="flex-1">
              <div className="font-medium text-sm">{network.name}</div>
              <div className="text-xs text-gray-500">{network.symbol}</div>
            </div>
            {currentNetwork?.id === network.id && (
              <div className="text-green-600 text-xs">✓</div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Header() {
  const pathname = usePathname()
  const { t } = useLocale()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-lg border-b border-blue-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-blue-400/50 transition-all duration-300">
                <span className="text-white font-bold text-sm">SF</span>
              </div>
              <span className="font-bold text-xl text-white hidden sm:block group-hover:text-blue-200 transition-colors">
                SocialFI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600/50 text-white border border-blue-500/30 shadow-lg'
                      : 'text-blue-100 hover:text-white hover:bg-blue-700/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{t(`menu.${item.name}`)}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right side - Controls */}
          <div className="flex items-center space-x-3">
            <NetworkSelectorCompact />
            <LanguageSwitcher />
            <WalletConnect />

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-700/50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-blue-700">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600/50 text-white border border-blue-500/30'
                        : 'text-blue-100 hover:text-white hover:bg-blue-700/50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{t(`menu.${item.name}`)}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
