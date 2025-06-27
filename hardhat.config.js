// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env-dev" });

const METIS_API_KEY = process.env.METIS_API_KEY;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const METIS_EXPLORER_API_KEY = process.env.METIS_EXPLORER_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        // Rede local de desenvolvimento
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337,
        },

        // Rede de teste Metis Sepolia
        metis_sepolia: {
            url: "https://sepolia.metisdevops.link",
            accounts: [PRIVATE_KEY],
            chainId: 59902,
            timeout: 120000,
            gasPrice: 1000000000, // 1 gwei fixo
            gas: 8000000,
            allowUnlimitedContractSize: true,
            blockGasLimit: 8000000,
        },

        // Rede de teste Ethereum Sepolia
        eth_sepolia: {
            url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
        },

        // Alias para compatibilidade (padrão: Ethereum Sepolia)
        sepolia: {
            url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
        }
    },

    // Configurações do Explorer para verificação de contratos
    etherscan: {
        apiKey: {
            metis_sepolia: METIS_EXPLORER_API_KEY || "api-key",
            eth_sepolia: ETHERSCAN_API_KEY || "api-key",
            sepolia: METIS_EXPLORER_API_KEY || "api-key"
        },
        customChains: [{
            network: "metis_sepolia",
            chainId: 133717,
            urls: {
                apiURL: "https://hyperion-testnet-explorer.metisdevops.link/api",
                browserURL: "https://hyperion-testnet-explorer.metisdevops.link"
            }
        }]
    },

    // Configurações de paths
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: './frontend/src/contracts/artifacts',
    },

    // Configurações de mocha para testes
    mocha: {
        timeout: 40000
    },

    gasReporter: {
        enabled: true,
        currency: "USD",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY
    },

    typechain: {
        outDir: './frontend/src/contracts/types',
        target: 'ethers-v6',
        alwaysGenerateOverloads: false,
        externalArtifacts: ['frontend/src/contracts/artifacts/**/*.json'],
    }
};