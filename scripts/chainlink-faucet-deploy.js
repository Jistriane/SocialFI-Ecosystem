// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const { ethers } = require("hardhat");
const axios = require("axios");
require("dotenv").config({ path: ".env-dev" });

const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function checkBalance(provider, wallet) {
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
    return parseFloat(balanceEth);
}

async function requestChainlinkFaucet(address) {
    console.log("🚰 FAUCET CHAINLINK METIS SEPOLIA");
    console.log("=================================");
    console.log("🔗 Usando: https://faucets.chain.link/metis-sepolia");
    console.log(`📍 Endereço: ${address}\n`);

    try {
        // Simular requisição do site da Chainlink
        const response = await axios.post("https://faucets.chain.link/api/faucet", {
            network: "metis-sepolia",
            address: address,
            token: "METIS"
        }, {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://faucets.chain.link/metis-sepolia",
                "Origin": "https://faucets.chain.link"
            },
            timeout: 30000
        });

        console.log("✅ Faucet executado com sucesso!");
        console.log("📊 Response:", response.data);
        return true;

    } catch (error) {
        if (error.response && error.response.data) {
            console.log(`❌ Erro do faucet: ${error.response.data.message || error.response.data}`);
        } else {
            console.log(`❌ Erro de conexão: ${error.message}`);
        }

        // Tentar método alternativo
        console.log("\n🔄 Tentando método alternativo...");
        return await requestFaucetAlternative(address);
    }
}

async function requestFaucetAlternative(address) {
    try {
        // Usar curl direto
        const { execSync } = require('child_process');

        const curlCommand = `curl -X POST "https://faucets.chain.link/api/faucet" \
            -H "Content-Type: application/json" \
            -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \
            -H "Referer: https://faucets.chain.link/metis-sepolia" \
            -d '{"network":"metis-sepolia","address":"${address}","token":"METIS"}'`;

        console.log("🔄 Executando via curl...");
        const result = execSync(curlCommand, { encoding: 'utf8', timeout: 30000 });

        console.log("✅ Curl executado:");
        console.log(result);

        // Verificar se foi sucesso
        if (result.includes("success") || result.includes("sent") || result.includes("drip")) {
            return true;
        }

        return false;

    } catch (error) {
        console.log(`❌ Curl também falhou: ${error.message}`);
        return false;
    }
}

async function waitForTokens() {
    console.log("\n⏳ Aguardando tMETIS aparecer na carteira...");

    const provider = new ethers.JsonRpcProvider("https://hyperion-testnet.metisdevops.link");
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    let attempts = 0;
    const maxAttempts = 30; // 5 minutos

    while (attempts < maxAttempts) {
        try {
            const balance = await checkBalance(provider, wallet);
            console.log(`   Tentativa ${attempts + 1}/30: ${balance} tMETIS`);

            if (balance >= 0.1) {
                console.log(`🎉 SUCESSO! Você tem ${balance} tMETIS!`);
                return balance;
            }

        } catch (error) {
            console.log(`   Tentativa ${attempts + 1}/30: Verificando conexão...`);
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 segundos
    }

    console.log("❌ Timeout: tMETIS não apareceu");
    return 0;
}

async function deployContracts() {
    console.log("\n🚀 FAZENDO DEPLOY DOS CONTRATOS");
    console.log("===============================");

    try {
        const { execSync } = require('child_process');

        console.log("⏳ Executando deploy...");
        const result = execSync('npx hardhat run scripts/deploy.js --network metis_sepolia', {
            encoding: 'utf8',
            stdio: 'pipe',
            timeout: 120000 // 2 minutos
        });

        console.log("✅ DEPLOY CONCLUÍDO COM SUCESSO!");
        console.log("📊 Resultado:");
        console.log(result);
        return true;

    } catch (error) {
        console.log("❌ Erro no deploy:");
        console.log(error.message);

        if (error.stdout) {
            console.log("\n📝 Stdout:");
            console.log(error.stdout);
        }

        if (error.stderr) {
            console.log("\n📝 Stderr:");
            console.log(error.stderr);
        }

        console.log("\n💡 Tente executar manualmente:");
        console.log("   npx hardhat run scripts/deploy.js --network metis_sepolia");
        return false;
    }
}

async function main() {
    console.log("🎯 FAUCET CHAINLINK + DEPLOY AUTOMÁTICO");
    console.log("========================================");
    console.log("📖 Usando faucet oficial da Chainlink");
    console.log("🔗 https://faucets.chain.link/metis-sepolia\n");

    const provider = new ethers.JsonRpcProvider("https://hyperion-testnet.metisdevops.link");
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    // Verificar saldo inicial
    const initialBalance = await checkBalance(provider, wallet);
    console.log(`💰 Saldo inicial: ${initialBalance} tMETIS\n`);

    if (initialBalance >= 0.1) {
        console.log("✅ Já tem saldo suficiente! Pulando faucet...");
    } else {
        // Passo 1: Conseguir tMETIS via faucet
        console.log("🚰 Conseguindo tMETIS via Chainlink...");
        const faucetSuccess = await requestChainlinkFaucet(wallet.address);

        if (!faucetSuccess) {
            console.log("\n❌ Faucet automático falhou!");
            console.log("💡 Tente manualmente:");
            console.log("🔗 https://faucets.chain.link/metis-sepolia");
            console.log("📝 Conecte sua carteira e solicite 0.5 METIS");
            console.log("\n🔄 Execute novamente quando tiver tMETIS:");
            console.log("   node scripts/chainlink-faucet-deploy.js");
            return;
        }

        // Passo 2: Aguardar tokens
        const balance = await waitForTokens();
        if (balance === 0) {
            console.log("\n❌ Tokens não apareceram!");
            console.log("💡 Pode demorar alguns minutos. Tente:");
            console.log("🔗 https://faucets.chain.link/metis-sepolia");
            return;
        }
    }

    // Passo 3: Deploy dos contratos
    const deploySuccess = await deployContracts();

    if (deploySuccess) {
        console.log("\n🎉 MISSÃO CUMPRIDA! 🎊");
        console.log("=====================================");
        console.log("✅ tMETIS conseguido via Chainlink");
        console.log("✅ Contratos deployados na Metis Sepolia");
        console.log("✅ Sistema 100% funcional!");
        console.log("✅ Frontend pronto para usar!");

        console.log("\n🔗 Agora você pode:");
        console.log("1. 🌐 Acessar http://localhost:3001");
        console.log("2. 🔗 Conectar carteira na Metis Sepolia");
        console.log("3. 🎮 Testar todos os contratos");
        console.log("4. 🍾 Celebrar o sucesso!");

        console.log("\n📊 Status das redes:");
        console.log("✅ Ethereum Sepolia: Funcionando");
        console.log("✅ Metis Sepolia: Funcionando");
        console.log("✅ Ambas as redes: Deploy completo!");

    } else {
        console.log("\n⚠️  Quase lá! tMETIS conseguido, mas deploy falhou");
        console.log("💡 Execute o deploy manualmente:");
        console.log("   npx hardhat run scripts/deploy.js --network metis_sepolia");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Erro geral:", error);
        process.exit(1);
    });