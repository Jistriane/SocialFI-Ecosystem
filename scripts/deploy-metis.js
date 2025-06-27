// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env-dev" });

async function main() {
    console.log("🚀 Iniciando deploy na Metis Sepolia...");
    console.log("========================================");

    // Verificar configurações
    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();

    console.log("📊 Informações da Rede:");
    console.log(`- Chain ID: ${network.chainId}`);
    console.log(`- Deployer: ${deployer.address}`);

    // Verificar saldo
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`- Saldo: ${ethers.formatEther(balance)} tMETIS`);

    if (balance < ethers.parseEther("0.01")) {
        console.log("⚠️  AVISO: Saldo baixo! Obtenha tMETIS em:");
        console.log("   https://hyperion-testnet-explorer.metisdevops.link");
        console.log("   Continuando mesmo assim...");
    }

    console.log("========================================");

    // Deploy dos contratos em ordem de dependência
    const contracts = {};

    try {
        // 1. RewardsToken (sem dependências)
        console.log("📝 1/5 - Deployando RewardsToken...");
        const RewardsToken = await ethers.getContractFactory("RewardsToken");
        contracts.rewardsToken = await RewardsToken.deploy();
        await contracts.rewardsToken.waitForDeployment();
        console.log(`✅ RewardsToken: ${await contracts.rewardsToken.getAddress()}`);

        // 2. TrustChain (sem dependências)
        console.log("📝 2/5 - Deployando TrustChain...");
        const TrustChain = await ethers.getContractFactory("TrustChain");
        contracts.trustChain = await TrustChain.deploy();
        await contracts.trustChain.waitForDeployment();
        console.log(`✅ TrustChain: ${await contracts.trustChain.getAddress()}`);

        // 3. TradeConnect (precisa do TrustChain)
        console.log("📝 3/5 - Deployando TradeConnect...");
        const TradeConnect = await ethers.getContractFactory("TradeConnect");
        contracts.tradeConnect = await TradeConnect.deploy(
            await contracts.trustChain.getAddress()
        );
        await contracts.tradeConnect.waitForDeployment();
        console.log(`✅ TradeConnect: ${await contracts.tradeConnect.getAddress()}`);

        // 4. GovGame (precisa do TrustChain e RewardsToken)
        console.log("📝 4/5 - Deployando GovGame...");
        const GovGame = await ethers.getContractFactory("GovGame");
        contracts.govGame = await GovGame.deploy(
            await contracts.trustChain.getAddress(),
            await contracts.rewardsToken.getAddress()
        );
        await contracts.govGame.waitForDeployment();
        console.log(`✅ GovGame: ${await contracts.govGame.getAddress()}`);

        // 5. EcosystemHub (precisa de todos os outros)
        console.log("📝 5/5 - Deployando EcosystemHub...");
        const EcosystemHub = await ethers.getContractFactory("EcosystemHub");
        contracts.ecosystemHub = await EcosystemHub.deploy(
            await contracts.trustChain.getAddress(),
            await contracts.tradeConnect.getAddress(),
            await contracts.govGame.getAddress(),
            await contracts.rewardsToken.getAddress()
        );
        await contracts.ecosystemHub.waitForDeployment();
        console.log(`✅ EcosystemHub: ${await contracts.ecosystemHub.getAddress()}`);

        console.log("========================================");
        console.log("🎉 DEPLOY CONCLUÍDO COM SUCESSO!");
        console.log("========================================");
        console.log("📋 ENDEREÇOS DOS CONTRATOS NA METIS SEPOLIA:");
        console.log(`RewardsToken: ${await contracts.rewardsToken.getAddress()}`);
        console.log(`🔗 TrustChain: ${await contracts.trustChain.getAddress()}`);
        console.log(`💼 TradeConnect: ${await contracts.tradeConnect.getAddress()}`);
        console.log(`🎮 GovGame: ${await contracts.govGame.getAddress()}`);
        console.log(`🌐 EcosystemHub: ${await contracts.ecosystemHub.getAddress()}`);
        console.log("========================================");
        console.log("🔍 Verificar contratos em:");
        console.log(`https://hyperion-testnet-explorer.metisdevops.link/address/${await contracts.ecosystemHub.getAddress()}`);
        console.log("========================================");

        // Salvar endereços em arquivo para uso posterior
        const addresses = {
            network: "metis_sepolia",
            chainId: 133717,
            contracts: {
                RewardsToken: await contracts.rewardsToken.getAddress(),
                TrustChain: await contracts.trustChain.getAddress(),
                TradeConnect: await contracts.tradeConnect.getAddress(),
                GovGame: await contracts.govGame.getAddress(),
                EcosystemHub: await contracts.ecosystemHub.getAddress(),
            },
            deployer: deployer.address,
            timestamp: new Date().toISOString()
        };

        // Salvar em arquivo JSON
        const fs = require('fs');
        fs.writeFileSync(
            'metis-deployment.json',
            JSON.stringify(addresses, null, 2)
        );
        console.log("💾 Endereços salvos em: metis-deployment.json");

        return addresses;

    } catch (error) {
        console.error("❌ Erro durante o deploy:", error.message);
        throw error;
    }
}

// Executar deploy
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Deploy falhou:", error);
            process.exit(1);
        });
}

module.exports = main;