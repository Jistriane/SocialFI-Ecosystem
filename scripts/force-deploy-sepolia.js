// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync("force-deploy.log", logMessage + "\n");
}

async function copyABIs() {
    try {
        await log(`📋 Copiando ABIs atualizados para o frontend...`);

        const sourceDir = path.join(__dirname, "../artifacts/contracts");
        const targetDir = path.join(__dirname, "../frontend/src/contracts/artifacts/contracts");

        // Cria diretório de destino se não existir
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Copia recursivamente
        const { spawn } = require('child_process');

        return new Promise((resolve, reject) => {
            const cp = spawn('cp', ['-r', `${sourceDir}/*`, targetDir], {
                shell: true,
                stdio: 'inherit'
            });

            cp.on('close', (code) => {
                if (code === 0) {
                    log(`✅ ABIs copiados com sucesso`);
                    resolve();
                } else {
                    reject(new Error(`Erro ao copiar ABIs: código ${code}`));
                }
            });
        });
    } catch (error) {
        await log(`❌ Erro ao copiar ABIs: ${error.message}`);
        throw error;
    }
}

async function deployWithRetry(contractFactory, args = [], retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            await log(`🔄 Tentativa ${i + 1}/${retries} de deploy...`);

            const gasPrice = await contractFactory.runner.provider.getFeeData();
            const deployOptions = {
                gasLimit: 5000000,
                gasPrice: gasPrice.gasPrice * 2 n
            };

            if (args.length > 0) {
                const contract = await contractFactory.deploy(...args, deployOptions);
                await contract.waitForDeployment();
                return contract;
            } else {
                const contract = await contractFactory.deploy(deployOptions);
                await contract.waitForDeployment();
                return contract;
            }
        } catch (error) {
            await log(`❌ Tentativa ${i + 1} falhou: ${error.message}`);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

async function main() {
    try {
        await log(`🚀 ===== DEPLOY FORÇADO NA ETHEREUM SEPOLIA =====`);

        const [deployer] = await ethers.getSigners();
        await log(`👤 Deployer: ${deployer.address}`);

        const balance = await deployer.provider.getBalance(deployer.address);
        const balanceEth = ethers.formatEther(balance);
        await log(`💰 Saldo: ${balanceEth} ETH`);

        if (parseFloat(balanceEth) < 0.01) {
            throw new Error(`❌ Saldo insuficiente! Precisa de pelo menos 0.01 ETH, tem ${balanceEth} ETH`);
        }

        const network = await deployer.provider.getNetwork();
        await log(`🌐 Rede conectada: ${network.name} (Chain ID: ${network.chainId})`);

        if (network.chainId !== 11155111 n) {
            throw new Error(`❌ Rede incorreta! Esperado Chain ID 11155111 (Sepolia), encontrado ${network.chainId}`);
        }

        const contracts = {};

        // 1. RewardsToken
        await log(`📝 Deployando RewardsToken...`);
        const RewardsToken = await ethers.getContractFactory("RewardsToken");
        const rewardsToken = await deployWithRetry(RewardsToken);
        contracts.RewardsToken = await rewardsToken.getAddress();
        await log(`✅ RewardsToken: ${contracts.RewardsToken}`);

        // 2. TrustChain  
        await log(`📝 Deployando TrustChain...`);
        const TrustChain = await ethers.getContractFactory("TrustChain");
        const trustChain = await deployWithRetry(TrustChain);
        contracts.TrustChain = await trustChain.getAddress();
        await log(`✅ TrustChain: ${contracts.TrustChain}`);

        // 3. TradeConnect
        await log(`📝 Deployando TradeConnect...`);
        const TradeConnect = await ethers.getContractFactory("TradeConnect");
        const tradeConnect = await deployWithRetry(TradeConnect, [contracts.TrustChain]);
        contracts.TradeConnect = await tradeConnect.getAddress();
        await log(`✅ TradeConnect: ${contracts.TradeConnect}`);

        // 4. GovGame
        await log(`📝 Deployando GovGame...`);
        const GovGame = await ethers.getContractFactory("GovGame");
        const govGame = await deployWithRetry(GovGame, [contracts.TrustChain, contracts.RewardsToken]);
        contracts.GovGame = await govGame.getAddress();
        await log(`✅ GovGame: ${contracts.GovGame}`);

        // 5. EcosystemHub (somente 3 parâmetros)
        await log(`📝 Deployando EcosystemHub...`);
        const EcosystemHub = await ethers.getContractFactory("EcosystemHub");
        const ecosystemHub = await deployWithRetry(EcosystemHub, [
            contracts.TrustChain,
            contracts.TradeConnect,
            contracts.GovGame
        ]);
        contracts.EcosystemHub = await ecosystemHub.getAddress();
        await log(`✅ EcosystemHub: ${contracts.EcosystemHub}`);

        // Copia ABIs para o frontend
        await copyABIs();

        // Atualiza frontend automaticamente
        await log(`🔧 Atualizando configuração do frontend...`);
        const configPath = path.join(__dirname, "../frontend/src/config/contracts.ts");

        const configContent = `// Auto-generated - Deploy forçado ${new Date().toISOString()}
import { Address } from 'viem'

// Endereços dos contratos deployados
export const CONTRACT_ADDRESSES = {
  11155111: {
    RewardsToken: "${contracts.RewardsToken}",
    TrustChain: "${contracts.TrustChain}",
    TradeConnect: "${contracts.TradeConnect}",
    GovGame: "${contracts.GovGame}",
    EcosystemHub: "${contracts.EcosystemHub}"
  }
} as const;

export const ACTIVE_NETWORK = 11155111;
export const NETWORK_NAME = "Ethereum Sepolia";

// Configuração dos contratos
interface ContractConfig {
  address: Address
  abi: any
}

// Função para obter configuração de contrato
export function getContractConfig(contractName: string): ContractConfig {
  const chainId = ACTIVE_NETWORK
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
  
  if (!addresses) {
    throw new Error(\`Endereços não encontrados para chain ID: \${chainId}\`)
  }
  
  const address = addresses[contractName as keyof typeof addresses]
  if (!address) {
    throw new Error(\`Contrato \${contractName} não encontrado para chain ID: \${chainId}\`)
  }
  
  // Carrega ABI dinamicamente
  let abi
  try {
    abi = require(\`../contracts/artifacts/contracts/\${contractName}.sol/\${contractName}.json\`)
  } catch (error) {
    console.warn(\`ABI não encontrado para \${contractName}, usando ABI básico\`)
    abi = { abi: [] }
  }
  
  return {
    address: address as Address,
    abi
  }
}

// Configurações específicas por contrato
export const CONTRACTS = {
  TrustChain: {
    name: 'TrustChain',
    description: 'Sistema de confiança e reputação',
  },
  TradeConnect: {
    name: 'TradeConnect', 
    description: 'Sistema de negociação P2P',
  },
  GovGame: {
    name: 'GovGame',
    description: 'Sistema de governança gamificada',
  },
  RewardsToken: {
    name: 'RewardsToken',
    description: 'Token de recompensas do ecossistema',
  },
  EcosystemHub: {
    name: 'EcosystemHub',
    description: 'Hub central do ecossistema',
  }
} as const

// Tipos
export type ContractName = keyof typeof CONTRACTS
export type ChainId = keyof typeof CONTRACT_ADDRESSES

// Utilitários
export function getContractAddress(contractName: ContractName, chainId: ChainId = ACTIVE_NETWORK): Address {
  const addresses = CONTRACT_ADDRESSES[chainId]
  if (!addresses) {
    throw new Error(\`Chain ID \${chainId} não suportado\`)
  }
  
  const address = addresses[contractName]
  if (!address) {
    throw new Error(\`Contrato \${contractName} não encontrado na chain \${chainId}\`)
  }
  
  return address as Address
}

export function getAllContracts(chainId: ChainId = ACTIVE_NETWORK) {
  return CONTRACT_ADDRESSES[chainId] || {}
}

export function isContractDeployed(contractName: ContractName, chainId: ChainId = ACTIVE_NETWORK): boolean {
  try {
    getContractAddress(contractName, chainId)
    return true
  } catch {
    return false
  }
}
`;

        fs.writeFileSync(configPath, configContent);
        await log(`✅ Frontend configurado para Ethereum Sepolia`);

        // Salva backup
        const backupFile = `deployed-sepolia-${Date.now()}.json`;
        fs.writeFileSync(backupFile, JSON.stringify({
            network: "Ethereum Sepolia",
            chainId: 11155111,
            timestamp: new Date().toISOString(),
            deployer: deployer.address,
            contracts
        }, null, 2));
        await log(`💾 Backup salvo: ${backupFile}`);

        // Verifica saldo final
        const finalBalance = await deployer.provider.getBalance(deployer.address);
        const gasUsed = parseFloat(balanceEth) - parseFloat(ethers.formatEther(finalBalance));
        await log(`⛽ Gas total usado: ~${gasUsed.toFixed(4)} ETH`);

        // Relatório final
        await log(`\n🎉 ===== DEPLOY FORÇADO CONCLUÍDO! =====`);
        await log(`📍 Rede: Ethereum Sepolia (Chain ID: 11155111)`);
        await log(`👤 Deployer: ${deployer.address}`);
        await log(`💰 Saldo restante: ${ethers.formatEther(finalBalance)} ETH`);
        await log(`📋 Contratos deployados:`);

        Object.entries(contracts).forEach(([name, address]) => {
            log(`   ${name}: ${address}`);
        });

        await log(`🔗 Explorer: https://sepolia.etherscan.io`);
        await log(`✅ Frontend configurado automaticamente`);
        await log(`📋 ABIs atualizados no frontend`);
        await log(`🚀 Sistema pronto para uso!`);

        return contracts;

    } catch (error) {
        await log(`❌ ERRO CRÍTICO: ${error.message}`);
        await log(`🔍 Stack trace: ${error.stack}`);
        throw error;
    }
}

if (require.main === module) {
    main()
        .then(() => {
            console.log("\n✅ Deploy forçado concluído com sucesso!");
            process.exit(0);
        })
        .catch((error) => {
            console.error(`\n❌ Deploy falhou: ${error.message}`);
            process.exit(1);
        });
}

module.exports = { main };