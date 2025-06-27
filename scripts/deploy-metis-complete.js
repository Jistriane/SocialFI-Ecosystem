// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const deployMetis = require('./deploy-metis.js');
const updateFrontend = require('./update-frontend-addresses.js');

async function deployCompleteMetis() {
    console.log("🚀 Deploy Completo na Metis Sepolia");
    console.log("===================================");
    console.log("Este script irá:");
    console.log("1. Fazer deploy dos contratos na Metis Sepolia");
    console.log("2. Atualizar automaticamente o frontend");
    console.log("3. Configurar o sistema multi-rede");
    console.log("===================================");

    try {
        // Passo 1: Deploy dos contratos
        console.log("\n🔸 PASSO 1: Deploy dos Contratos");
        console.log("================================");
        const deployResult = await deployMetis();

        if (!deployResult) {
            throw new Error("Deploy dos contratos falhou");
        }

        console.log("✅ Deploy dos contratos concluído com sucesso!");

        // Passo 2: Atualizar frontend
        console.log("\n🔸 PASSO 2: Atualizar Frontend");
        console.log("==============================");
        const updateResult = await updateFrontend();

        if (!updateResult) {
            throw new Error("Atualização do frontend falhou");
        }

        console.log("✅ Frontend atualizado com sucesso!");

        // Passo 3: Instruções finais
        console.log("\n🔸 PASSO 3: Configuração Final");
        console.log("==============================");
        console.log("✅ Sistema Multi-Rede Configurado!");
        console.log("");
        console.log("📋 SISTEMA AGORA SUPORTA:");
        console.log("• ✅ Ethereum Sepolia (funcionando)");
        console.log("• ✅ Metis Sepolia (recém-deployado)");
        console.log("");
        console.log("🚀 PRÓXIMOS PASSOS:");
        console.log("1. Reinicie o frontend:");
        console.log("   cd frontend && npm run dev");
        console.log("");
        console.log("2. Configure o frontend para Metis Sepolia:");
        console.log("   - Altere NEXT_PUBLIC_CHAIN_ID=133717");
        console.log("   - Ou use o switcher de rede na interface");
        console.log("");
        console.log("3. Teste a conectividade:");
        console.log("   - Conecte sua carteira");
        console.log("   - Mude para Metis Sepolia");
        console.log("   - Teste as funcionalidades");
        console.log("");
        console.log("🔍 VERIFICAR CONTRATOS:");
        console.log(`https://hyperion-testnet-explorer.metisdevops.link`);
        console.log("");
        console.log("================================================");
        console.log("🎉 DEPLOY MULTI-REDE CONCLUÍDO COM SUCESSO!");
        console.log("================================================");

        return true;

    } catch (error) {
        console.error("\n❌ ERRO NO DEPLOY COMPLETO:", error.message);
        console.log("\n🔧 SOLUÇÕES POSSÍVEIS:");
        console.log("1. Verifique se tem tMETIS suficiente:");
        console.log("   npm run faucet:metis");
        console.log("");
        console.log("2. Verifique a conectividade com Metis:");
        console.log("   npm run check:metis-balance");
        console.log("");
        console.log("3. Tente novamente:");
        console.log("   npm run deploy:metis-complete");
        console.log("");
        return false;
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    deployCompleteMetis()
        .then((success) => {
            process.exit(success ? 0 : 1);
        })
        .catch((error) => {
            console.error("❌ Erro:", error);
            process.exit(1);
        });
}

module.exports = deployCompleteMetis;