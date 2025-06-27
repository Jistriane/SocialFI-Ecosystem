// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env-dev" });

const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Lista de RPCs da Metis Sepolia para testar
const METIS_RPCS = [
    "https://hyperion-testnet.metisdevops.link",
    "https://metis-sepolia.rpc.thirdweb.com",
    "https://metis-sepolia-testnet.rpc.thirdweb.com",
    "https://sepolia.metisdevops.link",
    "https://metis-sepolia.drpc.org",
];

async function testRPC(rpcUrl) {
    try {
        console.log(`\n🔍 Testando RPC: ${rpcUrl}`);

        const provider = new ethers.JsonRpcProvider(rpcUrl);

        // Teste 1: Verificar chainId
        console.log("   ⏳ Verificando chainId...");
        const network = await provider.getNetwork();
        console.log(`   ✅ ChainId: ${network.chainId}`);

        if (network.chainId !== BigInt(133717)) {
            console.log(`   ❌ ChainId incorreto! Esperado: 133717, Recebido: ${network.chainId}`);
            return false;
        }

        // Teste 2: Verificar último bloco
        console.log("   ⏳ Verificando último bloco...");
        const blockNumber = await provider.getBlockNumber();
        console.log(`   ✅ Último bloco: ${blockNumber}`);

        // Teste 3: Verificar saldo da carteira
        if (PRIVATE_KEY) {
            console.log("   ⏳ Verificando saldo da carteira...");
            const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
            const balance = await provider.getBalance(wallet.address);
            const balanceEth = ethers.formatEther(balance);
            console.log(`   ✅ Endereço: ${wallet.address}`);
            console.log(`   ✅ Saldo: ${balanceEth} tMETIS`);

            if (parseFloat(balanceEth) > 0) {
                console.log(`   🎉 PERFEITO! Este RPC funciona e você tem ${balanceEth} tMETIS!`);
                return { rpcUrl, balance: balanceEth, address: wallet.address };
            }
        }

        console.log(`   ✅ RPC funcionando, mas sem saldo verificado`);
        return { rpcUrl, working: true };

    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log("🚀 Testando RPCs da Metis Sepolia...\n");

    const workingRPCs = [];

    for (const rpc of METIS_RPCS) {
        const result = await testRPC(rpc);
        if (result) {
            workingRPCs.push(result);
        }

        // Pequena pausa entre testes
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 RESUMO DOS RESULTADOS:");
    console.log("=".repeat(60));

    if (workingRPCs.length === 0) {
        console.log("❌ Nenhum RPC da Metis está funcionando!");
        console.log("💡 Possíveis soluções:");
        console.log("   1. Verificar conexão com internet");
        console.log("   2. Tentar novamente em alguns minutos");
        console.log("   3. Verificar se a Metis Sepolia não está em manutenção");
    } else {
        console.log(`✅ ${workingRPCs.length} RPC(s) funcionando:`);

        workingRPCs.forEach((rpc, index) => {
            console.log(`\n${index + 1}. ${rpc.rpcUrl}`);
            if (rpc.balance) {
                console.log(`   💰 Saldo: ${rpc.balance} tMETIS`);
                console.log(`   📍 Endereço: ${rpc.address}`);
            }
        });

        // Recomendar o melhor RPC
        const bestRPC = workingRPCs.find(rpc => rpc.balance) || workingRPCs[0];
        console.log(`\n🏆 RECOMENDADO: ${bestRPC.rpcUrl}`);

        if (bestRPC.balance) {
            console.log(`\n🎯 PRONTO PARA DEPLOY! Você tem ${bestRPC.balance} tMETIS`);
            console.log("Execute: npx hardhat run scripts/deploy.js --network metis_sepolia");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Erro:", error);
        process.exit(1);
    });