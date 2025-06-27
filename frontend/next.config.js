// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    eslint: {
        // Ignorar erros de ESLint durante o build
        ignoreDuringBuilds: true,
    },
    // Forçar uso do SWC
    compiler: {
        // Configuração do compilador SWC
        removeConsole: process.env.NODE_ENV === 'production',
    },
    images: {
        domains: ['ipfs.io', 'gateway.pinata.cloud', 'assets.coingecko.com', 'raw.githubusercontent.com'],
    },
    i18n: {
        // Lista de idiomas suportados
        locales: ['pt-BR', 'en'],
        // Idioma padrão
        defaultLocale: 'pt-BR',
        // Detectar automaticamente idioma do navegador
        localeDetection: false,
    },
    webpack: (config, { isServer, dev }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
            }
        }

        // Otimizações para resolver problemas de chunk loading
        if (dev) {
            config.optimization = {
                ...config.optimization,
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        default: {
                            minChunks: 2,
                            priority: -20,
                            reuseExistingChunk: true,
                        },
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'vendors',
                            priority: -10,
                            chunks: 'all',
                        },
                    },
                },
            }
        }

        config.externals.push('pino-pretty', 'lokijs', 'encoding')

        return config
    },
    experimental: {
        typedRoutes: true,
        esmExternals: true,
        serverComponentsExternalPackages: ['wagmi', '@rainbow-me/rainbowkit'],
    },
    env: {
        NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
        NEXT_PUBLIC_ALCHEMY_RPC_URL: process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || '',
        NEXT_PUBLIC_COINMARKETCAP_API_KEY: process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY || '',
        CUSTOM_KEY: process.env.CUSTOM_KEY || '',
    },
    // Configurações para melhorar performance de desenvolvimento
    devIndicators: {
        buildActivity: true,
        buildActivityPosition: 'bottom-right',
    },
    // Configurar headers para segurança
    async headers() {
        return [{
            source: '/(.*)',
            headers: [{
                    key: 'X-Frame-Options',
                    value: 'DENY',
                },
                {
                    key: 'X-Content-Type-Options',
                    value: 'nosniff',
                },
                {
                    key: 'Referrer-Policy',
                    value: 'origin-when-cross-origin',
                },
            ],
        }, ]
    },
}

module.exports = nextConfig;