// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import axios from 'axios';

const CMC_API_KEY = process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY;
const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1';

// Configuração do cliente axios
const cmcClient = axios.create({
  baseURL: CMC_API_URL,
  headers: {
    'X-CMC_PRO_API_KEY': CMC_API_KEY,
    'Accept': 'application/json',
  },
});

// Interface para os parâmetros de listagem
interface ListingsParams {
  start?: number;
  limit?: number;
  convert?: string;
  sort?: string;
  sort_dir?: 'asc' | 'desc';
  cryptocurrency_type?: string;
}

// Interface para os parâmetros de cotação
interface QuoteParams {
  symbol: string;
  convert?: string;
}

// Serviço do CoinMarketCap
export const CoinMarketCapService = {
  // Obter listagem de criptomoedas
  async getListings(params: ListingsParams = {}) {
    try {
      const response = await cmcClient.get('/cryptocurrency/listings/latest', {
        params: {
          start: params.start || 1,
          limit: params.limit || 100,
          convert: params.convert || 'USD',
          sort: params.sort || 'market_cap',
          sort_dir: params.sort_dir || 'desc',
          cryptocurrency_type: params.cryptocurrency_type || 'all',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter listagem do CoinMarketCap:', error);
      throw error;
    }
  },

  // Obter cotação de uma criptomoeda específica
  async getQuote(params: QuoteParams) {
    try {
      const response = await cmcClient.get('/cryptocurrency/quotes/latest', {
        params: {
          symbol: params.symbol,
          convert: params.convert || 'USD',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter cotação do CoinMarketCap:', error);
      throw error;
    }
  },

  // Obter metadados de uma criptomoeda
  async getMetadata(symbol: string) {
    try {
      const response = await cmcClient.get('/cryptocurrency/info', {
        params: {
          symbol,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter metadados do CoinMarketCap:', error);
      throw error;
    }
  },

  // Obter dados globais do mercado
  async getGlobalMetrics(convert: string = 'USD') {
    try {
      const response = await cmcClient.get('/global-metrics/quotes/latest', {
        params: {
          convert,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter métricas globais do CoinMarketCap:', error);
      throw error;
    }
  },
};

export default CoinMarketCapService; 