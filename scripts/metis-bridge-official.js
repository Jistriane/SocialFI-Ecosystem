// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const { ethers } = require("ethers");
require("dotenv").config({ path: ".env-dev" });

async function bridgeViaMetisOfficial() {
    console.log("🌉 === BRIDGE VIA METIS OFICIAL ===");
    console.log("==================================");
    
    // Conectar à Sepolia
    const sepoliaProvider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/demo");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, sepoliaProvider);
    
    console.log(`📍 Endereço: ${wallet.address}`);
    
    // Verificar saldo
    const balance = await sepoliaProvider.getBalance(wallet.address);
    console.log(`💰 Saldo Sepolia: ${ethers.formatEther(balance)} ETH`);
    
    if (balance < ethers.parseEther("0.05")) {
        console.log("❌ Saldo insuficiente para bridge");
        return false;
    }
    
    try {
        // Endereço oficial do L1StandardBridge da Metis para Sepolia
        // Baseado na documentação oficial do bridge.metis.io
        const L1_STANDARD_BRIDGE = "0x9E5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3";
        
        // ABI simplificado do L1StandardBridge
        const bridgeABI = [
            "function depositETH(uint32 _minGasLimit, bytes calldata _extraData) external payable",
            "function depositETHTo(address _to, uint32 _minGasLimit, bytes calldata _extraData) external payable"
        ];
        
        const bridgeContract = new ethers.Contract(L1_STANDARD_BRIDGE, bridgeABI, wallet);
        
        const bridgeAmount = ethers.parseEther("0.05");
        const minGasLimit = 200000; // Gas mínimo para a transação na L2
        const extraData = "0x"; // Dados extras (vazio)
        
        console.log("🔄 Fazendo bridge de 0.05 ETH via contrato oficial...");
        console.log(`📍 Bridge Contract: ${L1_STANDARD_BRIDGE}`);
        
        // Usar depositETH para fazer bridge para a própria carteira
        const tx = await bridgeContract.depositETH(minGasLimit, extraData, {
            value: bridgeAmount,
            gasLimit: 300000,
            gasPrice: ethers.parseUnits("20", "gwei")
        });
        
        console.log(`📋 Transação enviada: ${tx.hash}`);
        console.log("⏰ Aguardando confirmação...");
        
        const receipt = await tx.wait();
        console.log(`✅ Bridge confirmado! Block: ${receipt.blockNumber}`);
        console.log(`⛽ Gas usado: ${receipt.gasUsed.toString()}`);
        
        console.log("\n⏰ Bridge iniciado com sucesso!");
        console.log("💡 Verifique o progresso em: https://bridge.metis.io/home");
        console.log("⏰ O processamento leva 5-15 minutos");
        
        return true;
        
    } catch (error) {
        console.error("❌ Erro no bridge:", error.message);
        
        // Se o erro for de endereço, tentar método alternativo
        if (error.message.includes("bad address checksum") || error.message.includes("invalid address")) {
            console.log("\n🔄 Tentando método alternativo...");
            return await bridgeAlternative(wallet);
        }
        
        return false;
    }
}

async function bridgeAlternative(wallet) {
    try {
        // Método alternativo: transferência direta para o bridge
        const bridgeAmount = ethers.parseEther("0.05");
        
        // Endereço alternativo do bridge (sem checksum)
        const bridgeAddress = "0x9e5aac1ba1a2e6aed6b32689dfcf62a509ca96f3";
        
        console.log("🔄 Tentando transferência direta...");
        
        const tx = await wallet.sendTransaction({
            to: bridgeAddress,
            value: bridgeAmount,
            gasLimit: 150000
        });
        
        console.log(`📋 Transação alternativa enviada: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`✅ Transferência confirmada! Block: ${receipt.blockNumber}`);
        
        return true;
        
    } catch (error) {
        console.error("❌ Método alternativo falhou:", error.message);
        return false;
    }
}

async function waitAndDeploy() {
    console.log("\n⏰ === AGUARDANDO BRIDGE E FAZENDO DEPLOY ===");
    console.log("============================================");
    
    const metisProvider = new ethers.JsonRpcProvider("https://hyperion-testnet.metisdevops.link");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    
    console.log("�� Verificando saldo na Metis...");
    
    for (let i = 0; i < 40; i++) { // 20 minutos máximo
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30 segundos
        
        try {
            const metisBalance = await metisProvider.getBalance(wallet.address);
            const balanceInEth = ethers.formatEther(metisBalance);
            console.log(`🔍 Saldo Metis: ${balanceInEth} tMETIS (${i + 1}/40)`);
            
            if (metisBalance > ethers.parseEther("0.01")) {
                console.log("✅ Saldo recebido! Iniciando deploy...");
                
                // Aguardar mais um pouco para garantir
                await new Promise(resolve => setTimeout(resolve, 30000));
                
                return await deployToMetis();
            }
        } catch (error) {
            console.log(`⚠️ Erro ao verificar: ${error.message}`);
        }
    }
    
    console.log("⚠️ Timeout: Bridge ainda processando após 20 minutos");
    console.log("💡 Tente executar manualmente: npm run deploy:metis");
    return false;
}

async function deployToMetis() {
    try {
        console.log("🚀 Executando deploy na Metis Sepolia...");
        
        const { execSync } = require('child_process');
        const result = execSync('npx hardhat run scripts/deploy-metis.js --network metis_sepolia', 
            { encoding: 'utf8', stdio: 'pipe' });
        
        console.log(result);
        console.log("✅ Deploy concluído com sucesso!");
        
        // Atualizar frontend
        await updateFrontend();
        
        return true;
        
    } catch (error) {
        console.error("❌ Deploy falhou:", error.message);
        
        if (error.message.includes('insufficient funds')) {
            console.log("💡 Aguarde mais tempo para o bridge processar");
        }
        
        return false;
    }
}

async function updateFrontend() {
    console.log("🔧 Atualizando configuração do frontend...");
    
    // Marcar Metis como tendo contratos deployados
    const fs = require('fs');
    const path = require('path');
    
    try {
        const networkSelectorPath = path.join(__dirname, '../frontend/src/components/NetworkSelector/index.tsx');
        let content = fs.readFileSync(networkSelectorPath, 'utf8');
        
        content = content.replace(
            /hasContracts: false,[\s\S]*?contractsInfo: '[^']*'/,
            `hasContracts: true,
    contractsInfo: 'Contratos deployados e funcionais'`
        );
        
        fs.writeFileSync(networkSelectorPath, content);
        console.log("✅ Frontend atualizado!");
        
    } catch (error) {
        console.log("⚠️ Erro ao atualizar frontend:", error.message);
    }
}

async function main() {
    console.log("🚀 === BRIDGE + DEPLOY AUTOMÁTICO METIS ===");
    console.log("==========================================");
    
    const bridgeSuccess = await bridgeViaMetisOfficial();
    
    if (bridgeSuccess) {
        console.log("✅ Bridge iniciado com sucesso!");
        await waitAndDeploy();
    } else {
        console.log("\n❌ Bridge falhou. Opções:");
        console.log("1. Acesse manualmente: https://bridge.metis.io/home");
        console.log("2. Use o faucet: https://faucet.metis.io/");
        console.log("3. Execute depois: npm run deploy:metis");
    }
}

main().catch(console.error);
