// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { render, screen, waitFor } from '@testing-library/react'
import { CryptoPrice } from '.'
import { useCoinMarketCap } from '@/hooks/useCoinMarketCap'

// Mock do hook useCoinMarketCap
jest.mock('@/hooks/useCoinMarketCap')

// Mock do hook useLocale
jest.mock('@/contexts/LocaleContext', () => ({
  useLocale: () => ({
    t: (key: string) => key,
  }),
}))

describe('CryptoPrice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve renderizar o componente com loading', () => {
    ;(useCoinMarketCap as jest.Mock).mockReturnValue({
      getQuote: jest.fn(),
      isLoading: true,
      error: null,
    })

    render(<CryptoPrice symbol="BTC" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('deve renderizar o componente com erro', () => {
    ;(useCoinMarketCap as jest.Mock).mockReturnValue({
      getQuote: jest.fn(),
      isLoading: false,
      error: new Error('Erro ao carregar preço'),
    })

    render(<CryptoPrice symbol="BTC" />)
    expect(screen.getByText('error_loading_price')).toBeInTheDocument()
  })

  it('deve renderizar o preço corretamente', async () => {
    const mockQuoteData = {
      data: {
        BTC: {
          quote: {
            USD: {
              price: 50000,
              percent_change_24h: 5.5,
              last_updated: '2023-12-20T12:00:00Z',
            },
          },
        },
      },
    }

    const mockGetQuote = jest.fn().mockResolvedValue(mockQuoteData)

    ;(useCoinMarketCap as jest.Mock).mockReturnValue({
      getQuote: mockGetQuote,
      isLoading: false,
      error: null,
    })

    render(<CryptoPrice symbol="BTC" />)

    await waitFor(() => {
      expect(screen.getByText('US$ 50.000,00')).toBeInTheDocument()
      expect(screen.getByText('+5,50%')).toBeInTheDocument()
    })

    expect(mockGetQuote).toHaveBeenCalledWith('BTC')
  })

  it('não deve mostrar a variação quando showChange é false', async () => {
    const mockQuoteData = {
      data: {
        BTC: {
          quote: {
            USD: {
              price: 50000,
              percent_change_24h: 5.5,
              last_updated: '2023-12-20T12:00:00Z',
            },
          },
        },
      },
    }

    const mockGetQuote = jest.fn().mockResolvedValue(mockQuoteData)

    ;(useCoinMarketCap as jest.Mock).mockReturnValue({
      getQuote: mockGetQuote,
      isLoading: false,
      error: null,
    })

    render(<CryptoPrice symbol="BTC" showChange={false} />)

    await waitFor(() => {
      expect(screen.getByText('US$ 50.000,00')).toBeInTheDocument()
      expect(screen.queryByText('+5,50%')).not.toBeInTheDocument()
    })
  })

  it('deve usar a moeda correta quando currency é especificado', async () => {
    const mockQuoteData = {
      data: {
        BTC: {
          quote: {
            EUR: {
              price: 45000,
              percent_change_24h: 5.5,
              last_updated: '2023-12-20T12:00:00Z',
            },
          },
        },
      },
    }

    const mockGetQuote = jest.fn().mockResolvedValue(mockQuoteData)

    ;(useCoinMarketCap as jest.Mock).mockReturnValue({
      getQuote: mockGetQuote,
      isLoading: false,
      error: null,
    })

    render(<CryptoPrice symbol="BTC" currency="EUR" />)

    await waitFor(() => {
      expect(screen.getByText('€ 45.000,00')).toBeInTheDocument()
    })

    expect(mockGetQuote).toHaveBeenCalledWith('BTC')
  })
})
