// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const { ethers } = require("hardhat");
const axios = require("axios");
require("dotenv").config({ path: ".env-dev" });

const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Faucets da Metis Sepolia
const FAUCETS = [{
        name: "Metis Official Faucet",
        url: "https://faucet.metis.io/api/faucet",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
        }
    },
    {
        name: "Alchemy Faucet",
        url: "https://metis-sepolia-faucet.alchemy.com/api/faucet",
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    }
];

async function requestFaucet(faucet, address) {
    try {
        console.log(`🚰 Tentando faucet: ${faucet.name}`);

        const payload = {
            address: address,
            network: "metis-sepolia",
            chainId: 133717
        };

        const response = await axios({
            method: faucet.method,
            url: faucet.url,
            headers: faucet.headers,
            data: payload,
            timeout: 30000
        });

        console.log(`   ✅ Sucesso! Response:`, response.data);
        return true;

    } catch (error) {
        console.log(`   ❌ Falhou: ${error.message}`);
        if (error.response && error.response.data) {
            console.log(`   📝 Detalhes:`, error.response.data);
        }
        return false;
    }
}

async function checkBalance(provider, wallet) {
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
    return parseFloat(balanceEth);
}

async function waitForBalance(provider, wallet, minBalance = 0.001, maxWait = 300) {
    console.log(`⏳ Aguardando ${minBalance} tMETIS na carteira...`);

    const startTime = Date.now();
    let attempts = 0;

    while (Date.now() - startTime < maxWait * 1000) {
        attempts++;
        const balance = await checkBalance(provider, wallet);

        console.log(`   Tentativa ${attempts}: ${balance} tMETIS`);

        if (balance >= minBalance) {
            console.log(`   🎉 Sucesso! Saldo suficiente: ${balance} tMETIS`);
            return balance;
        }

        // Aguardar 10 segundos antes da próxima verificação
        await new Promise(resolve => setTimeout(resolve, 10000));
    }

    throw new Error(`Timeout: Não conseguiu ${minBalance} tMETIS em ${maxWait} segundos`);
}

async function deployContracts() {
    console.log("\n🚀 Iniciando deploy dos contratos...");

    try {
        // Usar o script de deploy existente
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
        if (error.stdout) console.log("Stdout:", error.stdout);
        if (error.stderr) console.log("Stderr:", error.stderr);
        return false;
    }
}

async function main() {
    console.log("🎯 AUTO FAUCET + DEPLOY METIS SEPOLIA");
    console.log("=====================================\n");

    // Configurar provider e wallet
    const provider = new ethers.JsonRpcProvider("https://hyperion-testnet.metisdevops.link");
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log(`📍 Endereço: ${wallet.address}`);

    // Verificar saldo inicial
    const initialBalance = await checkBalance(provider, wallet);
    console.log(`💰 Saldo inicial: ${initialBalance} tMETIS\n`);

    if (initialBalance >= 0.001) {
        console.log("✅ Já tem saldo suficiente! Pulando faucet...");
    } else {
        console.log("🚰 Saldo insuficiente, tentando faucets...\n");

        // Tentar todos os faucets
        let faucetSuccess = false;
        for (const faucet of FAUCETS) {
            const success = await requestFaucet(faucet, wallet.address);
            if (success) {
                faucetSuccess = true;
                break;
            }

            // Pausa entre tentativas
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        if (!faucetSuccess) {
            console.log("\n⚠️  Faucets automáticos falharam. Tentando método alternativo...");

            // Método alternativo: usar curl direto
            try {
                const { execSync } = require('child_process');
                const curlCommand = `curl -X POST "https://faucet.metis.io/api/faucet" \
                    -H "Content-Type: application/json" \
                    -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \
                    -d '{"address":"${wallet.address}","network":"metis-sepolia"}'`;

                console.log("🔄 Tentando via curl...");
                const result = execSync(curlCommand, { encoding: 'utf8' });
                console.log("✅ Curl executado:", result);

            } catch (error) {
                console.log("❌ Curl também falhou:", error.message);
            }
        }

        // Aguardar saldo aparecer
        try {
            await waitForBalance(provider, wallet, 0.001, 120); // 2 minutos
        } catch (error) {
            console.log(`\n❌ ${error.message}`);
            console.log("\n💡 SOLUÇÕES MANUAIS:");
            console.log("1. 🔗 Faucet manual: https://faucet.metis.io/");
            console.log("2. 🌉 Bridge: https://bridge.metis.io/");
            console.log("3. 💬 Discord Metis: https://discord.gg/metis");
            console.log("\n🔄 Execute novamente quando tiver tMETIS:");
            console.log("   node scripts/auto-faucet-deploy.js");
            return;
        }
    }

    // Verificar saldo final antes do deploy
    const finalBalance = await checkBalance(provider, wallet);
    console.log(`\n💰 Saldo para deploy: ${finalBalance} tMETIS`);

    if (finalBalance < 0.001) {
        console.log("❌ Saldo ainda insuficiente para deploy!");
        return;
    }

    // Fazer deploy
    const deploySuccess = await deployContracts();

    if (deploySuccess) {
        console.log("\n🎉 SUCESSO TOTAL!");
        console.log("✅ tMETIS conseguido via faucet");
        console.log("✅ Contratos deployados na Metis Sepolia");
        console.log("✅ Sistema pronto para usar!");

        console.log("\n🔗 Próximos passos:");
        console.log("1. Verificar contratos no explorer");
        console.log("2. Testar frontend com Metis Sepolia");
        console.log("3. Atualizar endereços no frontend");
    } else {
        console.log("\n⚠️  Faucet funcionou, mas deploy falhou");
        console.log("💡 Tente executar manualmente:");
        console.log("   npx hardhat run scripts/deploy.js --network metis_sepolia");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Erro geral:", error);
        process.exit(1);
    });