// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env-dev" });

const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Redes Metis para verificar
const METIS_NETWORKS = [{
        name: "Metis Mainnet",
        rpc: "https://andromeda.metis.io",
        chainId: 1088,
        symbol: "METIS"
    },
    {
        name: "Metis Sepolia Testnet",
        rpc: "https://hyperion-testnet.metisdevops.link",
        chainId: 133717,
        symbol: "tMETIS"
    },
    {
        name: "Metis Goerli Testnet (Antigo)",
        rpc: "https://metis-goerli.rpc.thirdweb.com",
        chainId: 59902,
        symbol: "tMETIS"
    }
];

async function checkNetwork(network) {
    try {
        console.log(`\n🔍 ${network.name} (ChainId: ${network.chainId})`);
        console.log(`   RPC: ${network.rpc}`);

        const provider = new ethers.JsonRpcProvider(network.rpc);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        // Verificar chainId
        const actualNetwork = await provider.getNetwork();
        console.log(`   ✅ ChainId confirmado: ${actualNetwork.chainId}`);

        // Verificar saldo
        const balance = await provider.getBalance(wallet.address);
        const balanceEth = ethers.formatEther(balance);

        console.log(`   📍 Endereço: ${wallet.address}`);
        console.log(`   💰 Saldo: ${balanceEth} ${network.symbol}`);

        if (parseFloat(balanceEth) > 0) {
            console.log(`   🎉 ENCONTRADO! Você tem ${balanceEth} ${network.symbol}`);
            return {...network, balance: balanceEth, hasBalance: true };
        } else {
            console.log(`   ⚪ Sem saldo nesta rede`);
            return {...network, balance: "0.0", hasBalance: false };
        }

    } catch (error) {
        console.log(`   ❌ Erro ao conectar: ${error.message}`);
        return {...network, error: error.message };
    }
}

async function main() {
    console.log("🚀 Verificando saldo em todas as redes Metis...");
    console.log(`📍 Endereço da carteira: ${new ethers.Wallet(PRIVATE_KEY).address}\n`);

    const results = [];

    for (const network of METIS_NETWORKS) {
        const result = await checkNetwork(network);
        results.push(result);

        // Pausa entre verificações
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("\n" + "=".repeat(70));
    console.log("📊 RESUMO COMPLETO:");
    console.log("=".repeat(70));

    const networksWithBalance = results.filter(r => r.hasBalance);
    const networksWorking = results.filter(r => !r.error);

    if (networksWithBalance.length > 0) {
        console.log("\n💰 REDES COM SALDO:");
        networksWithBalance.forEach(network => {
            console.log(`   ✅ ${network.name}: ${network.balance} ${network.symbol}`);
        });

        // Verificar se tem na Sepolia (necessária para deploy)
        const sepoliaNetwork = networksWithBalance.find(n => n.chainId === 133717);
        if (sepoliaNetwork) {
            console.log(`\n🎯 PERFEITO! Você tem ${sepoliaNetwork.balance} tMETIS na Sepolia!`);
            console.log("   Pode fazer o deploy agora:");
            console.log("   npx hardhat run scripts/deploy.js --network metis_sepolia");
        } else {
            console.log("\n⚠️  ATENÇÃO: Você tem METIS, mas não na rede Sepolia testnet!");
            console.log("   Para fazer deploy na Sepolia, você precisa de tMETIS na Sepolia.");
        }
    } else {
        console.log("\n❌ NENHUM SALDO ENCONTRADO em nenhuma rede Metis");
    }

    console.log("\n🔧 REDES FUNCIONANDO:");
    networksWorking.forEach(network => {
        const status = network.hasBalance ? "💰 COM SALDO" : "⚪ SEM SALDO";
        console.log(`   ${network.name}: ${status}`);
    });

    const brokenNetworks = results.filter(r => r.error);
    if (brokenNetworks.length > 0) {
        console.log("\n⚠️  REDES COM PROBLEMAS:");
        brokenNetworks.forEach(network => {
            console.log(`   ❌ ${network.name}: ${network.error}`);
        });
    }

    // Soluções
    console.log("\n" + "=".repeat(70));
    console.log("💡 PRÓXIMOS PASSOS:");
    console.log("=".repeat(70));

    const mainnetBalance = results.find(r => r.chainId === 1088 && r.hasBalance);
    const sepoliaBalance = results.find(r => r.chainId === 133717 && r.hasBalance);

    if (sepoliaBalance) {
        console.log("✅ 1. Você JÁ tem tMETIS na Sepolia - pode fazer deploy!");
        console.log("   Execute: npx hardhat run scripts/deploy.js --network metis_sepolia");
    } else if (mainnetBalance) {
        console.log("🌉 1. Você tem METIS na mainnet - precisa fazer bridge para Sepolia:");
        console.log("   🔗 Bridge oficial: https://bridge.metis.io/");
        console.log("   📝 Selecione: Metis Mainnet → Metis Sepolia Testnet");
    } else {
        console.log("🚰 1. Você precisa conseguir tMETIS na Sepolia:");
        console.log("   🔗 Faucet: https://faucet.metis.io/");
        console.log("   🔗 Bridge: https://bridge.metis.io/");
    }

    console.log("\n📖 2. Documentação útil:");
    console.log("   🔗 Metis Docs: https://docs.metis.io/");
    console.log("   🔗 Sepolia Explorer: https://hyperion-testnet-explorer.metisdevops.link/");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Erro:", error);
        process.exit(1);
    });