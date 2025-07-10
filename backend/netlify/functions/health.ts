// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, _context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const response = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'SocialFI Backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      networks: {
        ethereum_sepolia: {
          chainId: 11155111,
          status: 'active'
        },
        metis_sepolia: {
          chainId: 59902,
          status: 'active'
        }
      }
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Health check error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        status: 'ERROR', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
    };
  }
}; 