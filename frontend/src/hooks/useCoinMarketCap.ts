// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { useState, useCallback } from 'react';
import CoinMarketCapService from '@/services/coinmarketcap.service';

interface UseCoinMarketCapOptions {
  defaultCurrency?: string;
}

interface ListingsParams {
  convert?: string;
  start?: number;
  limit?: number;
  sort?: string;
  sort_dir?: 'asc' | 'desc';
  cryptocurrency_type?: string;
}

export function useCoinMarketCap(options: UseCoinMarketCapOptions = {}) {
  const { defaultCurrency = 'USD' } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Obter listagem de criptomoedas
  const getListings = useCallback(async (params: ListingsParams = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await CoinMarketCapService.getListings({
        ...params,
        convert: params.convert || defaultCurrency,
      });
      setIsLoading(false);
      return data;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }, [defaultCurrency]);

  // Obter cotação de uma criptomoeda específica
  const getQuote = useCallback(async (symbol: string, convert?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await CoinMarketCapService.getQuote({
        symbol,
        convert: convert || defaultCurrency,
      });
      setIsLoading(false);
      return data;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }, [defaultCurrency]);

  // Obter metadados de uma criptomoeda
  const getMetadata = useCallback(async (symbol: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await CoinMarketCapService.getMetadata(symbol);
      setIsLoading(false);
      return data;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }, []);

  // Obter dados globais do mercado
  const getGlobalMetrics = useCallback(async (convert?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await CoinMarketCapService.getGlobalMetrics(convert || defaultCurrency);
      setIsLoading(false);
      return data;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }, [defaultCurrency]);

  return {
    isLoading,
    error,
    getListings,
    getQuote,
    getMetadata,
    getGlobalMetrics,
  };
}

export default useCoinMarketCap; 