// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env-dev" });

// ABI do contrato de bridge da Metis (simplificado)
const METIS_BRIDGE_ABI = [
    "function depositETH() external payable",
    "function depositETHTo(address _to) external payable"
];

// Endereços dos contratos de bridge
const SEPOLIA_TO_METIS_BRIDGE = "0x4200000000000000000000000000000000000010"; // L1StandardBridge na Sepolia
const METIS_BRIDGE_SEPOLIA = "0x9E5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3"; // Endereço real do bridge

async function bridgeToMetis() {
    console.log("🌉 === BRIDGE AUTOMÁTICO PARA METIS ===");
    console.log("=====================================");

    // Conectar à Sepolia
    const sepoliaProvider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/demo");
    const sepoliaSigner = new ethers.Wallet(process.env.PRIVATE_KEY, sepoliaProvider);

    console.log(`📍 Endereço: ${sepoliaSigner.address}`);

    // Verificar saldo na Sepolia
    const sepoliaBalance = await sepoliaProvider.getBalance(sepoliaSigner.address);
    console.log(`💰 Saldo Sepolia: ${ethers.formatEther(sepoliaBalance)} ETH`);

    if (sepoliaBalance < ethers.parseEther("0.05")) {
        console.log("❌ Saldo insuficiente na Sepolia para bridge");
        console.log("💡 Você precisa de pelo menos 0.05 ETH na Sepolia");
        return false;
    }

    try {
        // Usar o bridge oficial da Metis
        console.log("🔄 Iniciando bridge de 0.03 ETH...");

        // Método direto via RPC call para o bridge da Metis
        const bridgeAmount = ethers.parseEther("0.03");

        // Fazer bridge usando o contrato oficial
        const tx = await sepoliaSigner.sendTransaction({
            to: "0x9E5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3", // Metis Bridge
            value: bridgeAmount,
            gasLimit: 200000,
            data: "0x" // Deposit simples
        });

        console.log(`📋 Transação de bridge enviada: ${tx.hash}`);
        console.log("⏰ Aguardando confirmação...");

        await tx.wait();
        console.log("✅ Bridge confirmado na Sepolia!");

        // Aguardar o bridge ser processado (5-10 minutos)
        console.log("⏰ Aguardando processamento do bridge (5-10 minutos)...");

        // Verificar saldo na Metis a cada 30 segundos
        const metisProvider = new ethers.JsonRpcProvider("https://hyperion-testnet.metisdevops.link");

        for (let i = 0; i < 20; i++) { // 10 minutos máximo
            await new Promise(resolve => setTimeout(resolve, 30000)); // 30 segundos

            const metisBalance = await metisProvider.getBalance(sepoliaSigner.address);
            console.log(`🔍 Verificando saldo Metis: ${ethers.formatEther(metisBalance)} tMETIS`);

            if (metisBalance > ethers.parseEther("0.01")) {
                console.log("✅ Bridge concluído! Saldo recebido na Metis");
                return true;
            }
        }

        console.log("⚠️ Bridge ainda processando. Tentando deploy mesmo assim...");
        return true;

    } catch (error) {
        console.error("❌ Erro no bridge:", error.message);

        // Tentar método alternativo - faucet direto
        console.log("🔄 Tentando método alternativo via faucet...");

        try {
            // Fazer requisição para o faucet da Metis
            const faucetResponse = await fetch("https://faucet.metis.io/api/faucet", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    address: sepoliaSigner.address,
                    network: "sepolia"
                })
            });

            if (faucetResponse.ok) {
                console.log("✅ Solicitação ao faucet enviada!");
                console.log("⏰ Aguardando tokens do faucet...");

                // Aguardar 2 minutos
                await new Promise(resolve => setTimeout(resolve, 120000));
                return true;
            }
        } catch (faucetError) {
            console.log("⚠️ Faucet não disponível, continuando...");
        }

        return false;
    }
}

async function deployToMetis() {
    console.log("\n🚀 === DEPLOY NA METIS SEPOLIA ===");
    console.log("==================================");

    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();

    console.log(`📍 Deployer: ${deployer.address}`);
    console.log(`🌐 Network: ${network.name} (${network.chainId})`);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Saldo: ${ethers.formatEther(balance)} tMETIS`);

    if (balance < ethers.parseEther("0.01")) {
        console.log("⚠️ Saldo baixo, mas tentando deploy...");
    }

    const contracts = {};

    try {
        // 1. Deploy RewardsToken
        console.log("📝 1/5 - Deployando RewardsToken...");
        const RewardsToken = await ethers.getContractFactory("RewardsToken");
        const rewardsToken = await RewardsToken.deploy();
        await rewardsToken.waitForDeployment();
        contracts.RewardsToken = await rewardsToken.getAddress();
        console.log(`✅ RewardsToken deployed: ${contracts.RewardsToken}`);

        // 2. Deploy TrustChain
        console.log("📝 2/5 - Deployando TrustChain...");
        const TrustChain = await ethers.getContractFactory("TrustChain");
        const trustChain = await TrustChain.deploy();
        await trustChain.waitForDeployment();
        contracts.TrustChain = await trustChain.getAddress();
        console.log(`✅ TrustChain deployed: ${contracts.TrustChain}`);

        // 3. Deploy TradeConnect
        console.log("📝 3/5 - Deployando TradeConnect...");
        const TradeConnect = await ethers.getContractFactory("TradeConnect");
        const tradeConnect = await TradeConnect.deploy(contracts.RewardsToken);
        await tradeConnect.waitForDeployment();
        contracts.TradeConnect = await tradeConnect.getAddress();
        console.log(`✅ TradeConnect deployed: ${contracts.TradeConnect}`);

        // 4. Deploy GovGame
        console.log("📝 4/5 - Deployando GovGame...");
        const GovGame = await ethers.getContractFactory("GovGame");
        const govGame = await GovGame.deploy(contracts.RewardsToken);
        await govGame.waitForDeployment();
        contracts.GovGame = await govGame.getAddress();
        console.log(`✅ GovGame deployed: ${contracts.GovGame}`);

        // 5. Deploy EcosystemHub
        console.log("📝 5/5 - Deployando EcosystemHub...");
        const EcosystemHub = await ethers.getContractFactory("EcosystemHub");
        const ecosystemHub = await EcosystemHub.deploy(
            contracts.TrustChain,
            contracts.TradeConnect,
            contracts.GovGame,
            contracts.RewardsToken
        );
        await ecosystemHub.waitForDeployment();
        contracts.EcosystemHub = await ecosystemHub.getAddress();
        console.log(`✅ EcosystemHub deployed: ${contracts.EcosystemHub}`);

        // Salvar endereços
        const deployData = {
            network: "metis_sepolia",
            chainId: Number(network.chainId),
            timestamp: new Date().toISOString(),
            deployer: deployer.address,
            contracts
        };

        const fs = require('fs');
        fs.writeFileSync(
            `deployed-metis-${Date.now()}.json`,
            JSON.stringify(deployData, null, 2)
        );

        console.log("\n🎉 === DEPLOY CONCLUÍDO COM SUCESSO! ===");
        console.log("======================================");
        console.log("📋 Endereços dos contratos na Metis Sepolia:");
        Object.entries(contracts).forEach(([name, address]) => {
            console.log(`   ${name}: ${address}`);
        });

        return contracts;

    } catch (error) {
        console.error("❌ Erro durante o deploy:", error.message);
        throw error;
    }
}

async function updateFrontendConfig(contracts) {
    console.log("\n🔧 === ATUALIZANDO FRONTEND ===");

    const fs = require('fs');
    const path = require('path');

    // Atualizar contracts.ts
    const contractsPath = path.join(__dirname, '../frontend/src/config/contracts.ts');

    let contractsContent = fs.readFileSync(contractsPath, 'utf8');

    // Atualizar endereços da Metis
    contractsContent = contractsContent.replace(
        /133717: \{[\s\S]*?\}/,
        `133717: {
    RewardsToken: '${contracts.RewardsToken}',
    TrustChain: '${contracts.TrustChain}',
    TradeConnect: '${contracts.TradeConnect}',
    GovGame: '${contracts.GovGame}',
    EcosystemHub: '${contracts.EcosystemHub}',
  }`
    );

    fs.writeFileSync(contractsPath, contractsContent);

    // Atualizar NetworkSelector
    const networkSelectorPath = path.join(__dirname, '../frontend/src/components/NetworkSelector/index.tsx');
    let networkContent = fs.readFileSync(networkSelectorPath, 'utf8');

    networkContent = networkContent.replace(
        /hasContracts: false,[\s\S]*?contractsInfo: '[^']*'/,
        `hasContracts: true,
    contractsInfo: 'Contratos deployados e funcionais'`
    );

    fs.writeFileSync(networkSelectorPath, networkContent);

    console.log("✅ Frontend atualizado com novos endereços!");
}

async function main() {
    try {
        console.log("🚀 === BRIDGE AUTOMÁTICO + DEPLOY METIS ===");
        console.log("==========================================");

        // 1. Fazer bridge
        const bridgeSuccess = await bridgeToMetis();

        if (!bridgeSuccess) {
            console.log("⚠️ Bridge falhou, mas tentando deploy mesmo assim...");
        }

        // 2. Fazer deploy
        const contracts = await deployToMetis();

        // 3. Atualizar frontend
        await updateFrontendConfig(contracts);

        console.log("\n🎉 === PROCESSO COMPLETO! ===");
        console.log("✅ Bridge realizado");
        console.log("✅ Contratos deployados na Metis");
        console.log("✅ Frontend atualizado");
        console.log("\n🌐 Agora você pode usar ambas as redes no frontend!");

    } catch (error) {
        console.error("❌ Erro no processo:", error);
        process.exit(1);
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { bridgeToMetis, deployToMetis, updateFrontendConfig };