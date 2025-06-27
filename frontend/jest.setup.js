// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import '@testing-library/jest-dom';

// Polyfill para TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock do localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock do navigator.language
Object.defineProperty(window.navigator, 'language', {
    value: 'pt-BR',
    configurable: true,
});

// Mock do require para arquivos de tradução
jest.mock('./src/locales/pt-BR/common.json', () => ({}), { virtual: true });
jest.mock('./src/locales/pt-BR/trustchain.json', () => ({}), { virtual: true });
jest.mock('./src/locales/pt-BR/tradeconnect.json', () => ({}), { virtual: true });
jest.mock('./src/locales/pt-BR/govgame.json', () => ({}), { virtual: true });
jest.mock('./src/locales/en/common.json', () => ({}), { virtual: true });
jest.mock('./src/locales/en/trustchain.json', () => ({}), { virtual: true });
jest.mock('./src/locales/en/tradeconnect.json', () => ({}), { virtual: true });
jest.mock('./src/locales/en/govgame.json', () => ({}), { virtual: true });

// Mock do next/router
jest.mock('next/router', () => ({
    useRouter() {
        return {
            route: '/',
            pathname: '',
            query: '',
            asPath: '',
            push: jest.fn(),
            events: {
                on: jest.fn(),
                off: jest.fn(),
            },
            beforePopState: jest.fn(() => null),
            prefetch: jest.fn(() => null),
        }
    },
}))

// Mock do next/navigation
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
        }
    },
    useSearchParams() {
        return {
            get: jest.fn(),
        }
    },
    usePathname() {
        return ''
    },
}))

// Mock do wagmi
jest.mock('wagmi', () => ({
    useAccount: jest.fn(() => ({
        address: '0x1234567890123456789012345678901234567890',
    })),
    useConnect: jest.fn(() => ({
        connect: jest.fn(),
        connectors: [],
        error: null,
        isLoading: false,
        pendingConnector: null,
    })),
    useDisconnect: jest.fn(() => ({
        disconnect: jest.fn(),
    })),
    useNetwork: jest.fn(() => ({
        chain: {
            id: 1,
            name: 'Ethereum',
        },
        chains: [],
    })),
    useSwitchNetwork: jest.fn(() => ({
        switchNetwork: jest.fn(),
    })),
    useBalance: jest.fn(() => ({
        data: {
            formatted: '0.00',
            symbol: 'ETH',
        },
    })),
    useContractRead: jest.fn(() => ({
        data: null,
        isError: false,
        isLoading: false,
    })),
    useContractWrite: jest.fn(() => ({
        write: jest.fn(),
        isLoading: false,
        isSuccess: false,
        isError: false,
    })),
    usePrepareContractWrite: jest.fn(() => ({
        config: {},
    })),
    useWaitForTransaction: jest.fn(() => ({
        isLoading: false,
        isSuccess: false,
        isError: false,
    })),
}))

// Mock do @rainbow-me/rainbowkit
jest.mock('@rainbow-me/rainbowkit', () => ({
    ConnectButton: {
        Custom: ({ children }) => {
            return children({
                account: {
                    address: '0x1234567890123456789012345678901234567890',
                    ensAvatar: null,
                },
                chain: {
                    hasIcon: true,
                    iconUrl: 'https://example.com/icon.png',
                    name: 'Sepolia',
                    id: 11155111,
                    unsupported: false,
                },
                openAccountModal: jest.fn(),
                openChainModal: jest.fn(),
                openConnectModal: jest.fn(),
                authenticationStatus: 'authenticated',
                mounted: true,
            })
        },
    },
}))

// Mock do socket.io-client
jest.mock('socket.io-client', () => {
    const mockSocket = {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
    }
    return jest.fn(() => mockSocket)
})

// Mock das variáveis de ambiente
process.env = {
    ...process.env,
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: '5284c55c0a7566500213bd96f36c6340',
    NEXT_PUBLIC_ALCHEMY_RPC_URL: 'https://eth-sepolia.g.alchemy.com/v2/61Zd4evHrQL88jxDE0WWi',
    NEXT_PUBLIC_COINMARKETCAP_API_KEY: '85dd99cc-78c9-4528-bc98-e9eb3fa9816b',
}

// Mock do ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

// Mock do IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
}

// Mock do window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

// Mock do window.scroll
window.scroll = jest.fn()
window.scrollTo = jest.fn()

// Mock do window.crypto
Object.defineProperty(window, 'crypto', {
    value: {
        getRandomValues: jest.fn().mockImplementation(arr => {
            return arr.map(() => Math.floor(Math.random() * 256))
        }),
        subtle: {
            digest: jest.fn(),
        },
    },
})

// Limpar todos os mocks após cada teste
afterEach(() => {
    jest.clearAllMocks();
});