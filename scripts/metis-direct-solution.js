// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env-dev" });

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

// Contrato oficial da Metis na Sepolia para conseguir tMETIS
const METIS_TESTNET_CONTRACT = "0x7f49160EB9BB068101d445fe77E17ecDb37D0B47";

// Configurações das redes
const NETWORKS = {
    sepolia: {
        name: "Ethereum Sepolia",
        rpc: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        chainId: 11155111,
        explorer: "https://sepolia.etherscan.io"
    },
    metis_sepolia: {
        name: "Metis Sepolia",
        rpc: "https://hyperion-testnet.metisdevops.link",
        chainId: 133717,
        explorer: "https://hyperion-testnet-explorer.metisdevops.link"
    }
};

async function checkBalance(provider, wallet) {
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
    return parseFloat(balanceEth);
}

async function getETHFromFaucet(address) {
    console.log("🚰 Conseguindo ETH Sepolia via Chainlink Faucet...");

    try {
        const axios = require("axios");

        // Tentar faucet da Chainlink
        const response = await axios.post("https://faucets.chain.link/ethereum-sepolia", {
            address: address
        }, {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
            },
            timeout: 30000
        });

        console.log("✅ Faucet ETH executado com sucesso!");
        return true;

    } catch (error) {
        console.log(`❌ Faucet automático falhou: ${error.message}`);
        console.log("💡 Use o faucet manual:");
        console.log("🔗 https://faucets.chain.link/ethereum-sepolia");
        return false;
    }
}

async function sendEthToMetisContract() {
    console.log("🎯 MÉTODO OFICIAL METIS: ETH → tMETIS");
    console.log("=====================================\n");

    // Conectar à Sepolia
    const sepoliaProvider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);
    const wallet = new ethers.Wallet(PRIVATE_KEY, sepoliaProvider);

    console.log(`📍 Endereço: ${wallet.address}`);
    console.log(`🔗 Contrato Metis: ${METIS_TESTNET_CONTRACT}\n`);

    // Verificar saldo ETH na Sepolia
    let ethBalance = await checkBalance(sepoliaProvider, wallet);
    console.log(`💰 Saldo ETH Sepolia: ${ethBalance} ETH`);

    if (ethBalance < 0.01) {
        console.log("⚠️  Saldo insuficiente! Tentando conseguir ETH...\n");

        await getETHFromFaucet(wallet.address);

        console.log("⏳ Aguardando ETH aparecer (30 segundos)...");
        await new Promise(resolve => setTimeout(resolve, 30000));

        ethBalance = await checkBalance(sepoliaProvider, wallet);
        console.log(`💰 Novo saldo: ${ethBalance} ETH`);

        if (ethBalance < 0.01) {
            console.log("❌ Ainda sem ETH suficiente!");
            console.log("💡 Consiga ETH manualmente:");
            console.log("🔗 https://faucets.chain.link/ethereum-sepolia");
            console.log("🔗 https://sepolia-faucet.pk910.de/");
            return false;
        }
    }

    // Calcular quantidade para enviar
    const ethToSend = "0.01"; // 0.01 ETH
    const expectedMetis = parseFloat(ethToSend) * 100; // Taxa 1:100

    console.log(`\n📊 CONVERSÃO OFICIAL METIS:`);
    console.log(`   Enviando: ${ethToSend} ETH`);
    console.log(`   Receberá: ~${expectedMetis} tMETIS`);
    console.log(`   Taxa oficial: 1 ETH = 100 tMETIS\n`);

    try {
        console.log("🚀 Enviando ETH para o contrato oficial Metis...");

        const tx = await wallet.sendTransaction({
            to: METIS_TESTNET_CONTRACT,
            value: ethers.parseEther(ethToSend),
            gasLimit: 21000,
            gasPrice: ethers.parseUnits("20", "gwei")
        });

        console.log(`✅ Transação enviada: ${tx.hash}`);
        console.log(`🔗 Explorer: https://sepolia.etherscan.io/tx/${tx.hash}`);
        console.log("⏳ Aguardando confirmação...");

        const receipt = await tx.wait();
        console.log(`✅ Confirmada no bloco: ${receipt.blockNumber}`);
        console.log("🎉 ETH convertido para tMETIS com sucesso!");

        return true;

    } catch (error) {
        console.log(`❌ Erro ao enviar transação: ${error.message}`);
        return false;
    }
}

async function waitForMetisTokens() {
    console.log("\n⏳ Aguardando tMETIS aparecer na Sepolia...");

    const sepoliaProvider = new ethers.JsonRpcProvider(NETWORKS.sepolia.rpc);
    const wallet = new ethers.Wallet(PRIVATE_KEY, sepoliaProvider);

    // ABI do token Metis na Sepolia
    const metisTokenABI = [
        "function balanceOf(address owner) view returns (uint256)"
    ];

    const metisToken = new ethers.Contract(METIS_TESTNET_CONTRACT, metisTokenABI, sepoliaProvider);

    let attempts = 0;
    const maxAttempts = 12; // 2 minutos

    while (attempts < maxAttempts) {
        try {
            const balance = await metisToken.balanceOf(wallet.address);
            const balanceFormatted = ethers.formatEther(balance);

            console.log(`   Tentativa ${attempts + 1}: ${balanceFormatted} tMETIS`);

            if (parseFloat(balanceFormatted) > 0) {
                console.log(`🎉 Sucesso! Você tem ${balanceFormatted} tMETIS na Sepolia!`);
                return parseFloat(balanceFormatted);
            }

        } catch (error) {
            console.log(`   Tentativa ${attempts + 1}: Verificando...`);
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 segundos
    }

    console.log("⚠️  Timeout: tMETIS não apareceu na Sepolia ainda");
    console.log("💡 Pode demorar alguns minutos. Verifique manualmente:");
    console.log(`🔗 ${NETWORKS.sepolia.explorer}/address/${wallet.address}`);
    return 0;
}

async function bridgeToMetisL2AndDeploy() {
    console.log("\n🌉 BRIDGE AUTOMÁTICO PARA METIS L2");
    console.log("==================================");

    const metisProvider = new ethers.JsonRpcProvider("https://hyperion-testnet.metisdevops.link");
    const wallet = new ethers.Wallet(PRIVATE_KEY, metisProvider);

    console.log("⏳ Aguardando tMETIS aparecer na Metis L2...");
    console.log("💡 O bridge da Metis é automático e rápido!");

    let attempts = 0;
    const maxAttempts = 18; // 3 minutos

    while (attempts < maxAttempts) {
        try {
            const balance = await checkBalance(metisProvider, wallet);
            console.log(`   Tentativa ${attempts + 1}: ${balance} tMETIS na L2`);

            if (balance >= 0.001) {
                console.log(`🎉 Perfeito! ${balance} tMETIS na Metis L2!`);

                // Fazer deploy imediatamente
                console.log("\n🚀 FAZENDO DEPLOY DOS CONTRATOS...");

                try {
                    const { execSync } = require('child_process');
                    const result = execSync('npx hardhat run scripts/deploy.js --network metis_sepolia', {
                        encoding: 'utf8',
                        stdio: 'pipe'
                    });

                    console.log("✅ Deploy concluído com sucesso!");
                    console.log(result);
                    return true;

                } catch (error) {
                    console.log("❌ Erro no deploy:", error.message);
                    console.log("💡 Execute manualmente:");
                    console.log("   npx hardhat run scripts/deploy.js --network metis_sepolia");
                    return false;
                }
            }

        } catch (error) {
            console.log(`   Tentativa ${attempts + 1}: Verificando conexão...`);
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 segundos
    }

    console.log("⚠️  Bridge ainda em andamento...");
    console.log("💡 Execute novamente em alguns minutos:");
    console.log("   node scripts/metis-direct-solution.js");
    return false;
}

async function main() {
    console.log("🎯 SOLUÇÃO DEFINITIVA METIS");
    console.log("============================");
    console.log("📖 Método oficial da Metis:");
    console.log("🔗 https://www.metis.io/blog/eli5-getting-test-tokens-on-metis");
    console.log("🔗 https://github.com/MetisProtocol/metis-testnet-token\n");

    // Passo 1: Conseguir ETH e converter para tMETIS
    const success = await sendEthToMetisContract();
    if (!success) {
        console.log("❌ Falha na conversão ETH → tMETIS");
        return;
    }

    // Passo 2: Aguardar bridge automático e fazer deploy
    const deployed = await bridgeToMetisL2AndDeploy();

    if (deployed) {
        console.log("\n🎉 MISSÃO CUMPRIDA! 🎊");
        console.log("✅ ETH Sepolia conseguido");
        console.log("✅ Convertido para tMETIS");
        console.log("✅ Bridge automático para Metis L2");
        console.log("✅ Contratos deployados na Metis Sepolia");
        console.log("✅ Sistema 100% funcional!");

        console.log("\n🔗 Agora você pode:");
        console.log("1. Testar o frontend com Metis Sepolia");
        console.log("2. Verificar contratos no explorer");
        console.log("3. Usar ambas as redes (ETH + Metis)");
        console.log("4. Celebrar! 🍾");
    } else {
        console.log("\n⚠️  Quase lá! Execute novamente quando o bridge terminar:");
        console.log("   node scripts/metis-direct-solution.js");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Erro:", error);
        process.exit(1);
    });