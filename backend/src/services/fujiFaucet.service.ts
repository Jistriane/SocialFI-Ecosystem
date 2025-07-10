// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const FUJI_FAUCET_URL = 'https://faucet.avax-test.network/'; // Endpoint sujeito a mudança
const FUJI_ADDRESS = process.env.FUJI_WALLET_ADDRESS || process.env.WALLET_ADDRESS;

if (!FUJI_ADDRESS) {
  console.error('Endereço da carteira Fuji não encontrado no .env (FUJI_WALLET_ADDRESS ou WALLET_ADDRESS)');
  process.exit(1);
}

export async function requestFujiAvaxFaucet(address: string) {
  try {
    console.log(`Solicitando AVAX do faucet Fuji para o endereço: ${address}`);
    const response = await axios.post(FUJI_FAUCET_URL, { address });
    console.log('Resposta do faucet:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error('Erro do faucet:', error.response.data);
    } else {
      console.error('Erro ao conectar ao faucet:', error.message);
    }
    throw error;
  }
}

// Execução direta via CLI
if (require.main === module) {
  requestFujiAvaxFaucet(FUJI_ADDRESS)
    .then(() => console.log('Solicitação concluída. Aguarde alguns minutos e verifique seu saldo na Fuji.'))
    .catch(() => process.exit(1));
} 