// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Configurações das redes
const NETWORKS = {
    sepolia: {
        name: "Ethereum Sepolia",
        chainId: 11155111,
        rpc: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        bridge: "0x4200000000000000000000000000000000000010", // Metis Bridge na Sepolia
        explorer: "https://sepolia.etherscan.io"
    },
    metis: {
        name: "Metis Sepolia",
        chainId: 133717,
        rpc: "https://hyperion-testnet.metisdevops.link",
        explorer: "https://hyperion-testnet-explorer.metisdevops.link"
    }
};

async function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);

    // Salva log em arquivo
    fs.appendFileSync("bridge-deploy.log", logMessage + "\n");
}

async function checkBalance(provider, address, network) {
    try {
        const balance = await provider.getBalance(address);
        const balanceEth = ethers.formatEther(balance);
        await log(`💰 Saldo em ${network}: ${balanceEth} ETH`);
        return { balance, balanceEth: parseFloat(balanceEth) };
    } catch (error) {
        await log(`❌ Erro ao verificar saldo em ${network}: ${error.message}`);
        return { balance: 0 n, balanceEth: 0 };
    }
}

async function bridgeToMetis(sepoliaProvider, wallet, amount) {
    try {
        await log(`🌉 Iniciando bridge de ${amount} ETH para Metis Sepolia...`);

        // Bridge simples - enviar ETH para o endereço da bridge
        const bridgeAddress = "0x4200000000000000000000000000000000000010";

        const tx = {
            to: bridgeAddress,
            value: ethers.parseEther(amount.toString()),
            gasLimit: 100000,
            gasPrice: ethers.parseUnits("20", "gwei")
        };

        await log(`📤 Enviando ${amount} ETH para bridge...`);
        const transaction = await wallet.sendTransaction(tx);
        await log(`🔄 Transação enviada: ${transaction.hash}`);

        await log(`⏳ Aguardando confirmação...`);
        const receipt = await transaction.wait();
        await log(`✅ Bridge confirmado! Gas usado: ${receipt.gasUsed.toString()}`);

        // Aguarda um tempo para o bridge processar
        await log(`⏳ Aguardando processamento do bridge (60 segundos)...`);
        await new Promise(resolve => setTimeout(resolve, 60000));

        return true;
    } catch (error) {
        await log(`❌ Erro no bridge: ${error.message}`);
        return false;
    }
}

async function deployContracts(network) {
    try {
        await log(`🚀 Iniciando deploy forçado na ${network}...`);

        // Força a mudança de rede
        hre.changeNetwork(network === "metis" ? "metis_sepolia" : "eth_sepolia");

        const [deployer] = await ethers.getSigners();
        await log(`👤 Deployer: ${deployer.address}`);

        const balance = await deployer.provider.getBalance(deployer.address);
        await log(`💰 Saldo do deployer: ${ethers.formatEther(balance)} ${network === "metis" ? "METIS" : "ETH"}`);

        if (parseFloat(ethers.formatEther(balance)) < 0.01) {
            throw new Error(`Saldo insuficiente para deploy: ${ethers.formatEther(balance)}`);
        }

        // Deploy dos contratos
        const contracts = {};

        // 1. RewardsToken
        await log(`📝 Deployando RewardsToken...`);
        const RewardsToken = await ethers.getContractFactory("RewardsToken");
        const rewardsToken = await RewardsToken.deploy({ gasLimit: 3000000 });
        await rewardsToken.waitForDeployment();
        contracts.RewardsToken = await rewardsToken.getAddress();
        await log(`✅ RewardsToken deployado: ${contracts.RewardsToken}`);

        // 2. TrustChain
        await log(`📝 Deployando TrustChain...`);
        const TrustChain = await ethers.getContractFactory("TrustChain");
        const trustChain = await TrustChain.deploy({ gasLimit: 3000000 });
        await trustChain.waitForDeployment();
        contracts.TrustChain = await trustChain.getAddress();
        await log(`✅ TrustChain deployado: ${contracts.TrustChain}`);

        // 3. TradeConnect
        await log(`📝 Deployando TradeConnect...`);
        const TradeConnect = await ethers.getContractFactory("TradeConnect");
        const tradeConnect = await TradeConnect.deploy(contracts.TrustChain, { gasLimit: 3000000 });
        await tradeConnect.waitForDeployment();
        contracts.TradeConnect = await tradeConnect.getAddress();
        await log(`✅ TradeConnect deployado: ${contracts.TradeConnect}`);

        // 4. GovGame
        await log(`📝 Deployando GovGame...`);
        const GovGame = await ethers.getContractFactory("GovGame");
        const govGame = await GovGame.deploy(contracts.TrustChain, contracts.RewardsToken, { gasLimit: 3000000 });
        await govGame.waitForDeployment();
        contracts.GovGame = await govGame.getAddress();
        await log(`✅ GovGame deployado: ${contracts.GovGame}`);

        // 5. EcosystemHub
        await log(`📝 Deployando EcosystemHub...`);
        const EcosystemHub = await ethers.getContractFactory("EcosystemHub");
        const ecosystemHub = await EcosystemHub.deploy(
            contracts.TrustChain,
            contracts.TradeConnect,
            contracts.GovGame,
            contracts.RewardsToken, { gasLimit: 3000000 }
        );
        await ecosystemHub.waitForDeployment();
        contracts.EcosystemHub = await ecosystemHub.getAddress();
        await log(`✅ EcosystemHub deployado: ${contracts.EcosystemHub}`);

        return contracts;
    } catch (error) {
        await log(`❌ Erro no deploy: ${error.message}`);
        throw error;
    }
}

async function updateFrontendConfig(contracts, network) {
    try {
        await log(`🔧 Atualizando configuração do frontend...`);

        const configPath = path.join(__dirname, "../frontend/src/config/contracts.ts");
        const chainId = network === "metis" ? 133717 : 11155111;

        const configContent = `// Auto-generated contract addresses - ${new Date().toISOString()}
export const CONTRACT_ADDRESSES = {
  ${chainId}: {
    RewardsToken: "${contracts.RewardsToken}",
    TrustChain: "${contracts.TrustChain}",
    TradeConnect: "${contracts.TradeConnect}",
    GovGame: "${contracts.GovGame}",
    EcosystemHub: "${contracts.EcosystemHub}"
  }
} as const;

export const ACTIVE_NETWORK = ${chainId};
export const NETWORK_NAME = "${network === "metis" ? "Metis Sepolia" : "Ethereum Sepolia"}";
`;

        fs.writeFileSync(configPath, configContent);
        await log(`✅ Frontend atualizado para ${network === "metis" ? "Metis Sepolia" : "Ethereum Sepolia"}`);

        // Salva backup dos endereços
        const backupPath = `deployed-addresses-${network}-${Date.now()}.json`;
        fs.writeFileSync(backupPath, JSON.stringify(contracts, null, 2));
        await log(`💾 Backup salvo: ${backupPath}`);

    } catch (error) {
        await log(`❌ Erro ao atualizar frontend: ${error.message}`);
    }
}

async function main() {
    try {
        await log(`🚀 ===== INICIANDO BRIDGE + DEPLOY FORÇADO =====`);

        // Configuração inicial
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            throw new Error("PRIVATE_KEY não configurada no .env-dev");
        }

        // Providers
        const sepoliaProvider = new ethers.JsonRpcProvider(NETWORKS.sepolia.rpc);
        const metisProvider = new ethers.JsonRpcProvider(NETWORKS.metis.rpc);

        // Wallets
        const sepoliaWallet = new ethers.Wallet(privateKey, sepoliaProvider);
        const metisWallet = new ethers.Wallet(privateKey, metisProvider);

        await log(`👤 Endereço da carteira: ${sepoliaWallet.address}`);

        // Verifica saldos
        const sepoliaBalance = await checkBalance(sepoliaProvider, sepoliaWallet.address, "Ethereum Sepolia");
        const metisBalance = await checkBalance(metisProvider, metisWallet.address, "Metis Sepolia");

        // Estratégia de deploy
        let deployNetwork = "sepolia";
        let needsBridge = false;

        if (metisBalance.balanceEth >= 0.05) {
            // Tem METIS suficiente, deploy direto na Metis
            deployNetwork = "metis";
            await log(`✅ Saldo METIS suficiente, deployando direto na Metis Sepolia`);
        } else if (sepoliaBalance.balanceEth >= 0.1) {
            // Tem ETH Sepolia, faz bridge
            deployNetwork = "metis";
            needsBridge = true;
            await log(`🌉 Fazendo bridge de ETH Sepolia para Metis Sepolia`);
        } else {
            // Deploy na Sepolia mesmo
            await log(`⚠️  Saldos baixos, deployando na Ethereum Sepolia`);
        }

        // Executa bridge se necessário
        if (needsBridge) {
            const bridgeAmount = Math.min(0.05, sepoliaBalance.balanceEth - 0.01); // Deixa 0.01 ETH para gas
            const bridgeSuccess = await bridgeToMetis(sepoliaProvider, sepoliaWallet, bridgeAmount);

            if (!bridgeSuccess) {
                await log(`⚠️  Bridge falhou, deployando na Ethereum Sepolia`);
                deployNetwork = "sepolia";
            }
        }

        // Deploy dos contratos
        await log(`🚀 Executando deploy na ${deployNetwork === "metis" ? "Metis Sepolia" : "Ethereum Sepolia"}...`);
        const contracts = await deployContracts(deployNetwork);

        // Atualiza frontend
        await updateFrontendConfig(contracts, deployNetwork);

        // Relatório final
        await log(`\n🎉 ===== DEPLOY CONCLUÍDO COM SUCESSO! =====`);
        await log(`📍 Rede: ${deployNetwork === "metis" ? "Metis Sepolia" : "Ethereum Sepolia"}`);
        await log(`📋 Contratos deployados:`);
        for (const [name, address] of Object.entries(contracts)) {
            await log(`   ${name}: ${address}`);
        }
        await log(`🔗 Explorer: ${NETWORKS[deployNetwork].explorer}`);
        await log(`✅ Frontend configurado automaticamente`);

    } catch (error) {
        await log(`❌ ERRO CRÍTICO: ${error.message}`);
        process.exit(1);
    }
}

// Execução
if (require.main === module) {
    main()
        .then(() => {
            console.log("\n✅ Script concluído com sucesso!");
            process.exit(0);
        })
        .catch((error) => {
            console.error(`\n❌ Erro fatal: ${error.message}`);
            process.exit(1);
        });
}

module.exports = { main };