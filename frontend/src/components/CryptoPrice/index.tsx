// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import { useEffect, useState } from 'react'
import { useCoinMarketCap } from '@/hooks/useCoinMarketCap'
import { useLocale } from '@/contexts/LocaleContext'
import { Loader2 } from 'lucide-react'

interface CryptoPriceProps {
  symbol: string
  currency?: string
  className?: string
  showChange?: boolean
}

interface PriceData {
  price: number
  change24h: number
  lastUpdated: string
}

export function CryptoPrice({ symbol, currency = 'USD', className = '', showChange = true }: CryptoPriceProps) {
  const { t } = useLocale()
  const { getQuote, isLoading, error } = useCoinMarketCap({ defaultCurrency: currency })
  const [priceData, setPriceData] = useState<PriceData | null>(null)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const data = await getQuote(symbol)
        const quote = data.data[symbol].quote[currency]
        setPriceData({
          price: quote.price,
          change24h: quote.percent_change_24h,
          lastUpdated: quote.last_updated,
        })
      } catch (err) {
        console.error('Erro ao obter preço:', err)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 60000) // Atualiza a cada minuto

    return () => clearInterval(interval)
  }, [symbol, currency, getQuote])

  if (isLoading) {
    return (
      <div className={`flex items-center ${className}`} role="status">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-red-500 ${className}`}>
        {t('error_loading_price')}
      </div>
    )
  }

  if (!priceData) {
    return null
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price)
  }

  const formatChange = (change: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      signDisplay: 'always',
    }).format(change / 100)
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span>{formatPrice(priceData.price)}</span>
      {showChange && (
        <span
          className={`text-sm ${
            priceData.change24h >= 0 ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {formatChange(priceData.change24h)}
        </span>
      )}
    </div>
  )
} 