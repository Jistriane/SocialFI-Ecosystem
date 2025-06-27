// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const { ethers } = require("hardhat");

async function main() {
    console.log("🎯 === CRIANDO PERFIL DE TESTE NA METIS SEPOLIA ===\n");

    // Configuração da rede Metis Sepolia
    const provider = new ethers.JsonRpcProvider("https://sepolia.metisdevops.link");
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
        console.error("❌ PRIVATE_KEY não definida no arquivo .env");
        process.exit(1);
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const userAddress = wallet.address;

    console.log("📍 Endereço da carteira:", userAddress);
    console.log("🌐 Rede: Metis Sepolia (59902)");
    console.log("🔗 RPC:", "https://sepolia.metisdevops.link");

    // Endereços dos contratos na Metis Sepolia
    const contracts = {
        TrustChain: "0xA6207a47E5D57f905A36756A4681607F12E66239",
        RewardsToken: "0x2a1df9d5b7D277a614607b4d8C82f3d085638751"
    };

    console.log("\n📋 Endereços dos contratos:");
    console.log("🔗 TrustChain:", contracts.TrustChain);
    console.log("💰 RewardsToken:", contracts.RewardsToken);

    try {
        // Verificar saldo
        const balance = await provider.getBalance(userAddress);
        const balanceInEth = ethers.formatEther(balance);
        console.log("\n💰 Saldo atual:", balanceInEth, "tMETIS");

        if (parseFloat(balanceInEth) < 0.01) {
            console.log("❌ Saldo insuficiente para criar perfil. Precisa de pelo menos 0.01 tMETIS");
            return;
        }

        // Carregar ABI do TrustChain
        const TrustChainArtifact = require("../frontend/contracts/abis/TrustChain.json");
        const trustChainContract = new ethers.Contract(contracts.TrustChain, TrustChainArtifact.abi, wallet);

        // Verificar se já tem perfil
        console.log("\n🔍 Verificando se perfil já existe...");
        try {
            const existingProfile = await trustChainContract.getUserProfile(userAddress);
            console.log("✅ Perfil já existe!");
            console.log("📋 Dados do perfil:");
            console.log("   - Username:", existingProfile[0]);
            console.log("   - Verificado:", existingProfile[1]);
            console.log("   - Trust Score:", existingProfile[2].toString());
            console.log("   - Última atualização:", new Date(Number(existingProfile[3]) * 1000).toLocaleString());
            return;
        } catch (error) {
            if (error.message.includes("Profile does not exist")) {
                console.log("📝 Perfil não existe. Criando novo perfil...");
            } else {
                throw error;
            }
        }

        // Criar perfil
        console.log("\n🚀 Criando perfil de teste...");
        const username = "UsuarioTesteMetis";

        console.log("📋 Dados do perfil:");
        console.log("   - Username:", username);

        const tx = await trustChainContract.createProfile(
            username, {
                gasLimit: 500000,
                gasPrice: ethers.parseUnits("1", "gwei")
            }
        );

        console.log("\n⏳ Transação enviada:", tx.hash);
        console.log("🔗 Explorer:", `https://sepolia-explorer.metisdevops.link/tx/${tx.hash}`);

        console.log("\n⏳ Aguardando confirmação...");
        const receipt = await tx.wait();

        console.log("✅ Perfil criado com sucesso!");
        console.log("📋 Detalhes da transação:");
        console.log("   - Hash:", receipt.hash);
        console.log("   - Bloco:", receipt.blockNumber);
        console.log("   - Gas usado:", receipt.gasUsed.toString());

        // Verificar perfil criado
        console.log("\n🔍 Verificando perfil criado...");
        const newProfile = await trustChainContract.getUserProfile(userAddress);
        console.log("✅ Perfil verificado!");
        console.log("📋 Dados finais:");
        console.log("   - Username:", newProfile[0]);
        console.log("   - Verificado:", newProfile[1]);
        console.log("   - Trust Score:", newProfile[2].toString());
        console.log("   - Última atualização:", new Date(Number(newProfile[3]) * 1000).toLocaleString());

        console.log("\n🎉 SUCESSO! Perfil criado na Metis Sepolia!");
        console.log("🌐 Agora você pode usar o frontend sem erros de 'Profile does not exist'");

    } catch (error) {
        console.error("\n❌ Erro:", error.message);

        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.log("💡 Dica: Você precisa de mais tMETIS para pagar o gas da transação");
        } else if (error.message.includes('execution reverted')) {
            console.log("💡 Dica: Verifique se o contrato está deployado corretamente");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Erro fatal:", error);
        process.exit(1);
    });