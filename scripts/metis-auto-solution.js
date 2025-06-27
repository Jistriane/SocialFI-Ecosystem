// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const { ethers } = require("hardhat");
const axios = require("axios");
require("dotenv").config({ path: ".env-dev" });

const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Faucets da Metis Sepolia
const METIS_FAUCETS = [
    "https://faucet.metis.io/",
    "https://sepolia-faucet.metis.io/",
    "https://testnet-faucet.metis.io/"
];

async function getMetisBalance() {
    try {
        const provider = new ethers.JsonRpcProvider("https://hyperion-testnet.metisdevops.link");
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const balance = await provider.getBalance(wallet.address);
        return {
            address: wallet.address,
            balance: ethers.formatEther(balance),
            balanceWei: balance.toString()
        };
    } catch (error) {
        console.log("❌ Erro ao verificar saldo:", error.message);
        return null;
    }
}

async function tryFaucet(faucetUrl, address) {
    try {
        console.log(`🚰 Tentando faucet: ${faucetUrl}`);

        // Simular requisição para o faucet
        const response = await axios.post(faucetUrl, {
            address: address,
            network: "sepolia"
        }, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            console.log("✅ Faucet respondeu positivamente!");
            return true;
        }
    } catch (error) {
        console.log(`❌ Faucet ${faucetUrl} falhou:`, error.message);
    }
    return false;
}

async function deployContracts() {
    try {
        console.log("\n🚀 Iniciando deploy dos contratos na Metis Sepolia...");

        const { spawn } = require('child_process');

        return new Promise((resolve, reject) => {
            const deployProcess = spawn('npx', ['hardhat', 'run', 'scripts/deploy.js', '--network', 'metis_sepolia'], {
                stdio: 'inherit',
                cwd: process.cwd()
            });

            deployProcess.on('close', (code) => {
                if (code === 0) {
                    console.log("✅ Deploy concluído com sucesso!");
                    resolve(true);
                } else {
                    console.log("❌ Deploy falhou");
                    resolve(false);
                }
            });

            deployProcess.on('error', (error) => {
                console.log("❌ Erro no deploy:", error);
                reject(error);
            });
        });
    } catch (error) {
        console.log("❌ Erro ao executar deploy:", error);
        return false;
    }
}

async function waitForBalance(targetBalance = "0.1") {
    console.log(`⏳ Aguardando ${targetBalance} tMETIS aparecer na carteira...`);

    for (let i = 0; i < 60; i++) { // 5 minutos máximo
        const balanceInfo = await getMetisBalance();
        if (balanceInfo && parseFloat(balanceInfo.balance) >= parseFloat(targetBalance)) {
            console.log(`✅ Balance encontrado: ${balanceInfo.balance} tMETIS`);
            return true;
        }

        process.stdout.write(`⏳ Tentativa ${i + 1}/60 - Saldo atual: ${balanceInfo?.balance || '0.0'} tMETIS\r`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 segundos
    }

    console.log("\n⏰ Timeout aguardando saldo");
    return false;
}

async function main() {
    console.log("🎯 SOLUÇÃO AUTOMÁTICA METIS SEPOLIA");
    console.log("=".repeat(50));

    // 1. Verificar saldo atual
    console.log("\n1️⃣ Verificando saldo atual...");
    const initialBalance = await getMetisBalance();

    if (!initialBalance) {
        console.log("❌ Não foi possível conectar à Metis Sepolia");
        return;
    }

    console.log(`📍 Endereço: ${initialBalance.address}`);
    console.log(`💰 Saldo atual: ${initialBalance.balance} tMETIS`);

    // 2. Se já tem saldo suficiente, fazer deploy direto
    if (parseFloat(initialBalance.balance) >= 0.1) {
        console.log("\n✅ Saldo suficiente encontrado! Fazendo deploy...");
        const deploySuccess = await deployContracts();
        if (deploySuccess) {
            console.log("\n🎉 SUCESSO! Contratos deployados na Metis Sepolia!");
        }
        return;
    }

    // 3. Tentar conseguir tMETIS via faucet
    console.log("\n2️⃣ Tentando conseguir tMETIS via faucets...");

    // Instruções manuais para o usuário
    console.log("\n🔧 AÇÃO NECESSÁRIA:");
    console.log("=".repeat(50));
    console.log("1. Abra seu navegador e vá para: https://faucet.metis.io/");
    console.log("2. Conecte sua carteira (mesma do endereço acima)");
    console.log("3. Selecione 'Metis Sepolia Testnet'");
    console.log("4. Solicite tMETIS");
    console.log("5. Aguarde a confirmação");
    console.log("\n⏳ Este script vai monitorar automaticamente seu saldo...");

    // 4. Monitorar saldo
    console.log("\n3️⃣ Monitorando saldo...");
    const balanceReceived = await waitForBalance("0.1");

    if (balanceReceived) {
        console.log("\n4️⃣ tMETIS recebido! Fazendo deploy...");
        const deploySuccess = await deployContracts();

        if (deploySuccess) {
            console.log("\n🎉 SUCESSO TOTAL!");
            console.log("✅ tMETIS obtido");
            console.log("✅ Contratos deployados na Metis Sepolia");
            console.log("✅ Sistema completo funcionando!");
        }
    } else {
        console.log("\n⚠️  Não foi possível obter tMETIS automaticamente");
        console.log("\n💡 SOLUÇÕES ALTERNATIVAS:");
        console.log("1. Tente o faucet manualmente: https://faucet.metis.io/");
        console.log("2. Entre no Discord da Metis e peça tMETIS");
        console.log("3. Use o bridge se tiver METIS na mainnet");
        console.log("\n🔄 Execute este script novamente após conseguir tMETIS");
    }
}

// Executar com tratamento de erros
main()
    .then(() => {
        console.log("\n✅ Script finalizado");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Erro crítico:", error);
        process.exit(1);
    });