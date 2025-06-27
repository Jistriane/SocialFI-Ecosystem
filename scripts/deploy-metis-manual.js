// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env-dev" });

async function main() {
    console.log("🚀 Deploy Manual na Metis Sepolia");
    console.log("========================================");
    console.log("📋 INSTRUÇÕES:");
    console.log("1. Vá para: https://bridge.metis.io/");
    console.log("2. Conecte sua carteira");
    console.log("3. Faça bridge de pelo menos 0.1 ETH para tMETIS");
    console.log("4. Aguarde a confirmação (5-10 minutos)");
    console.log("5. Execute novamente este script");
    console.log("========================================");

    // Verificar configurações
    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();

    console.log("📊 Informações da Rede:");
    console.log(`- Chain ID: ${network.chainId}`);
    console.log(`- Deployer: ${deployer.address}`);

    // Verificar saldo
    const balance = await ethers.provider.getBalance(deployer.address);
    const balanceEth = ethers.formatEther(balance);
    console.log(`- Saldo: ${balanceEth} tMETIS`);

    if (balance < ethers.parseEther("0.05")) {
        console.log("❌ SALDO INSUFICIENTE!");
        console.log("💡 SOLUÇÕES:");
        console.log("1. Bridge via https://bridge.metis.io/");
        console.log("2. Faucet: https://hyperion-testnet-explorer.metisdevops.link");
        console.log("3. Aguarde e tente novamente");
        return;
    }

    console.log("✅ Saldo suficiente! Iniciando deploy...");
    console.log("========================================");

    // Deploy dos contratos
    const contracts = {};
    const deployedAddresses = {};

    try {
        // 1. RewardsToken
        console.log("📝 1/5 - Deployando RewardsToken...");
        const RewardsToken = await ethers.getContractFactory("RewardsToken");
        contracts.rewardsToken = await RewardsToken.deploy();
        await contracts.rewardsToken.waitForDeployment();
        deployedAddresses.RewardsToken = await contracts.rewardsToken.getAddress();
        console.log(`✅ RewardsToken: ${deployedAddresses.RewardsToken}`);

        // 2. TrustChain
        console.log("📝 2/5 - Deployando TrustChain...");
        const TrustChain = await ethers.getContractFactory("TrustChain");
        contracts.trustChain = await TrustChain.deploy();
        await contracts.trustChain.waitForDeployment();
        deployedAddresses.TrustChain = await contracts.trustChain.getAddress();
        console.log(`✅ TrustChain: ${deployedAddresses.TrustChain}`);

        // 3. TradeConnect
        console.log("📝 3/5 - Deployando TradeConnect...");
        const TradeConnect = await ethers.getContractFactory("TradeConnect");
        contracts.tradeConnect = await TradeConnect.deploy(deployedAddresses.TrustChain);
        await contracts.tradeConnect.waitForDeployment();
        deployedAddresses.TradeConnect = await contracts.tradeConnect.getAddress();
        console.log(`✅ TradeConnect: ${deployedAddresses.TradeConnect}`);

        // 4. GovGame
        console.log("📝 4/5 - Deployando GovGame...");
        const GovGame = await ethers.getContractFactory("GovGame");
        contracts.govGame = await GovGame.deploy(
            deployedAddresses.TrustChain,
            deployedAddresses.RewardsToken
        );
        await contracts.govGame.waitForDeployment();
        deployedAddresses.GovGame = await contracts.govGame.getAddress();
        console.log(`✅ GovGame: ${deployedAddresses.GovGame}`);

        // 5. EcosystemHub
        console.log("📝 5/5 - Deployando EcosystemHub...");
        const EcosystemHub = await ethers.getContractFactory("EcosystemHub");
        contracts.ecosystemHub = await EcosystemHub.deploy(
            deployedAddresses.TrustChain,
            deployedAddresses.TradeConnect,
            deployedAddresses.GovGame,
            deployedAddresses.RewardsToken
        );
        await contracts.ecosystemHub.waitForDeployment();
        deployedAddresses.EcosystemHub = await contracts.ecosystemHub.getAddress();
        console.log(`✅ EcosystemHub: ${deployedAddresses.EcosystemHub}`);

        console.log("========================================");
        console.log("🎉 DEPLOY CONCLUÍDO COM SUCESSO!");
        console.log("========================================");
        console.log("📋 ENDEREÇOS DOS CONTRATOS NA METIS SEPOLIA:");
        Object.entries(deployedAddresses).forEach(([name, address]) => {
            console.log(`${name}: ${address}`);
        });
        console.log("========================================");

        // Atualizar frontend automaticamente
        console.log("🔧 Atualizando configuração do frontend...");
        await updateFrontendConfig(deployedAddresses);

        console.log("✅ Deploy e configuração concluídos!");
        console.log("🌐 Acesse: http://localhost:3001");

    } catch (error) {
        console.error("❌ Erro durante o deploy:", error.message);
        throw error;
    }
}

async function updateFrontendConfig(addresses) {
    const fs = require('fs');
    const path = require('path');

    // Atualizar contracts.ts
    const contractsPath = path.join(__dirname, '../frontend/src/config/contracts.ts');

    let contractsContent = fs.readFileSync(contractsPath, 'utf8');

    // Atualizar endereços da Metis Sepolia
    contractsContent = contractsContent.replace(
        /133717: \{[\s\S]*?\}/,
        `133717: {
    RewardsToken: '${addresses.RewardsToken}',
    TrustChain: '${addresses.TrustChain}',
    TradeConnect: '${addresses.TradeConnect}',
    GovGame: '${addresses.GovGame}',
    EcosystemHub: '${addresses.EcosystemHub}',
  }`
    );

    fs.writeFileSync(contractsPath, contractsContent);
    console.log("✅ Frontend atualizado com novos endereços");
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Deploy falhou:", error);
            process.exit(1);
        });
}

module.exports = main;