// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const { ethers } = require("ethers");
require("dotenv").config({ path: ".env-dev" });

async function getMetisTokens() {
    console.log("💰 === OBTENDO tMETIS PARA DEPLOY ===");
    console.log("====================================");
    
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    console.log(`📍 Endereço: ${wallet.address}`);
    
    // Método 1: Usar faucet via curl
    console.log("🔄 Tentando faucet da Metis...");
    
    try {
        const { execSync } = require('child_process');
        
        // Fazer requisição ao faucet
        const faucetCommand = `curl -X POST "https://faucet.metis.io/api/faucet" \
  -H "Content-Type: application/json" \
  -d '{"address": "${wallet.address}", "network": "sepolia"}' \
  --connect-timeout 30`;
        
        console.log("📋 Enviando requisição ao faucet...");
        const result = execSync(faucetCommand, { encoding: 'utf8', timeout: 30000 });
        
        console.log("📋 Resposta do faucet:", result);
        
        if (result.includes('success') || result.includes('Success')) {
            console.log("✅ Faucet solicitado com sucesso!");
            
            // Aguardar tokens
            await waitForTokens(wallet.address);
            return true;
        } else {
            console.log("⚠️ Faucet pode ter limitações, tentando método alternativo...");
        }
        
    } catch (error) {
        console.log("⚠️ Faucet via API falhou:", error.message);
    }
    
    // Método 2: Instruções manuais
    console.log("\n📋 === INSTRUÇÕES MANUAIS ===");
    console.log("1. 🌐 Acesse: https://faucet.metis.io/");
    console.log(`2. 📍 Cole o endereço: ${wallet.address}`);
    console.log("3. 🔗 Conecte sua carteira");
    console.log("4. 💰 Solicite tMETIS");
    console.log("5. ⏰ Aguarde 2-3 minutos");
    console.log("\n💡 Depois execute: npm run deploy:metis");
    
    return false;
}

async function waitForTokens(address) {
    console.log("\n⏰ Aguardando tokens do faucet...");
    
    const metisProvider = new ethers.JsonRpcProvider("https://hyperion-testnet.metisdevops.link");
    
    for (let i = 0; i < 20; i++) { // 10 minutos
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30 segundos
        
        try {
            const balance = await metisProvider.getBalance(address);
            const balanceInEth = ethers.formatEther(balance);
            console.log(`🔍 Saldo Metis: ${balanceInEth} tMETIS (${i + 1}/20)`);
            
            if (balance > ethers.parseEther("0.01")) {
                console.log("✅ Tokens recebidos! Fazendo deploy...");
                await deployNow();
                return true;
            }
        } catch (error) {
            console.log(`⚠️ Erro ao verificar: ${error.message}`);
        }
    }
    
    console.log("⚠️ Timeout: Tokens não recebidos em 10 minutos");
    return false;
}

async function deployNow() {
    try {
        console.log("\n🚀 === FAZENDO DEPLOY NA METIS ===");
        
        const { execSync } = require('child_process');
        
        console.log("🔄 Executando deploy...");
        const result = execSync('npx hardhat run scripts/deploy-metis.js --network metis_sepolia', 
            { encoding: 'utf8', stdio: 'inherit' });
        
        console.log("\n✅ === DEPLOY CONCLUÍDO! ===");
        
        // Atualizar NetworkSelector
        await updateNetworkSelector();
        
        console.log("�� Sistema completo! Ambas as redes funcionando!");
        
    } catch (error) {
        console.error("❌ Deploy falhou:", error.message);
        
        if (error.message.includes('insufficient funds')) {
            console.log("💡 Aguarde mais tokens ou tente o faucet novamente");
        }
    }
}

async function updateNetworkSelector() {
    try {
        const fs = require('fs');
        const path = require('path');
        
        const filePath = path.join(__dirname, '../frontend/src/components/NetworkSelector/index.tsx');
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Atualizar status da Metis
        content = content.replace(
            /hasContracts: false,[\s\S]*?contractsInfo: '[^']*'/,
            `hasContracts: true,
    contractsInfo: 'Contratos deployados e funcionais'`
        );
        
        fs.writeFileSync(filePath, content);
        console.log("✅ NetworkSelector atualizado!");
        
    } catch (error) {
        console.log("⚠️ Erro ao atualizar NetworkSelector:", error.message);
    }
}

// Executar
getMetisTokens().catch(console.error);
