// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const fs = require('fs');
const path = require('path');

async function updateFrontendAddresses() {
    console.log("🔄 Atualizando endereços dos contratos no frontend...");
    console.log("================================================");

    try {
        // Ler arquivo de deployment da Metis
        const deploymentPath = path.join(__dirname, '..', 'metis-deployment.json');

        if (!fs.existsSync(deploymentPath)) {
            console.log("❌ Arquivo metis-deployment.json não encontrado!");
            console.log("Execute primeiro: npm run deploy:metis");
            return false;
        }

        const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        console.log("✅ Arquivo de deployment carregado");
        console.log(`- Rede: ${deployment.network}`);
        console.log(`- Chain ID: ${deployment.chainId}`);
        console.log(`- Timestamp: ${deployment.timestamp}`);

        // Endereços dos contratos
        const addresses = deployment.contracts;
        console.log("\n📋 Endereços dos contratos:");
        Object.entries(addresses).forEach(([name, address]) => {
            console.log(`- ${name}: ${address}`);
        });

        // Atualizar frontend/.env-dev
        const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env-dev');

        if (!fs.existsSync(frontendEnvPath)) {
            console.log("❌ Arquivo frontend/.env-dev não encontrado!");
            return false;
        }

        let envContent = fs.readFileSync(frontendEnvPath, 'utf8');
        console.log("\n🔧 Atualizando frontend/.env-dev...");

        // Adicionar variáveis para Metis Sepolia
        const metisVariables = `
# Contratos - Metis Sepolia (deployados automaticamente)
NEXT_PUBLIC_METIS_REWARDS_TOKEN_ADDRESS=${addresses.RewardsToken}
NEXT_PUBLIC_METIS_TRUST_CHAIN_ADDRESS=${addresses.TrustChain}
NEXT_PUBLIC_METIS_TRADE_CONNECT_ADDRESS=${addresses.TradeConnect}
NEXT_PUBLIC_METIS_GOV_GAME_ADDRESS=${addresses.GovGame}
NEXT_PUBLIC_METIS_ECOSYSTEM_HUB_ADDRESS=${addresses.EcosystemHub}

# Configuração para Metis Sepolia
NEXT_PUBLIC_METIS_CHAIN_ID=133717
NEXT_PUBLIC_METIS_RPC_URL=https://hyperion-testnet.metisdevops.link
NEXT_PUBLIC_METIS_EXPLORER_URL=https://hyperion-testnet-explorer.metisdevops.link
`;

        // Verificar se já existem as variáveis Metis
        if (envContent.includes('NEXT_PUBLIC_METIS_REWARDS_TOKEN_ADDRESS')) {
            // Atualizar endereços existentes
            envContent = envContent.replace(
                /NEXT_PUBLIC_METIS_REWARDS_TOKEN_ADDRESS=.*/g,
                `NEXT_PUBLIC_METIS_REWARDS_TOKEN_ADDRESS=${addresses.RewardsToken}`
            );
            envContent = envContent.replace(
                /NEXT_PUBLIC_METIS_TRUST_CHAIN_ADDRESS=.*/g,
                `NEXT_PUBLIC_METIS_TRUST_CHAIN_ADDRESS=${addresses.TrustChain}`
            );
            envContent = envContent.replace(
                /NEXT_PUBLIC_METIS_TRADE_CONNECT_ADDRESS=.*/g,
                `NEXT_PUBLIC_METIS_TRADE_CONNECT_ADDRESS=${addresses.TradeConnect}`
            );
            envContent = envContent.replace(
                /NEXT_PUBLIC_METIS_GOV_GAME_ADDRESS=.*/g,
                `NEXT_PUBLIC_METIS_GOV_GAME_ADDRESS=${addresses.GovGame}`
            );
            envContent = envContent.replace(
                /NEXT_PUBLIC_METIS_ECOSYSTEM_HUB_ADDRESS=.*/g,
                `NEXT_PUBLIC_METIS_ECOSYSTEM_HUB_ADDRESS=${addresses.EcosystemHub}`
            );
            console.log("✅ Endereços Metis atualizados no arquivo existente");
        } else {
            // Adicionar novas variáveis
            envContent += metisVariables;
            console.log("✅ Variáveis Metis adicionadas ao arquivo");
        }

        // Salvar arquivo atualizado
        fs.writeFileSync(frontendEnvPath, envContent);
        console.log("✅ Arquivo frontend/.env-dev atualizado");

        // Atualizar contracts.ts para incluir endereços Metis
        const contractsPath = path.join(__dirname, '..', 'frontend', 'src', 'config', 'contracts.ts');

        if (fs.existsSync(contractsPath)) {
            let contractsContent = fs.readFileSync(contractsPath, 'utf8');

            // Atualizar endereços para Metis Sepolia
            const metisAddressesUpdate = `
  [SUPPORTED_CHAIN_IDS.METIS_SEPOLIA]: { // Metis Sepolia
    EcosystemHub: '${addresses.EcosystemHub}' as Address,
    GovGame: '${addresses.GovGame}' as Address,
    RewardsToken: '${addresses.RewardsToken}' as Address,
    TradeConnect: '${addresses.TradeConnect}' as Address,
    TrustChain: '${addresses.TrustChain}' as Address,
  },`;

            // Substituir a seção Metis Sepolia
            contractsContent = contractsContent.replace(
                /\[SUPPORTED_CHAIN_IDS\.METIS_SEPOLIA\]: \{[^}]+\},/s,
                metisAddressesUpdate.trim() + ','
            );

            fs.writeFileSync(contractsPath, contractsContent);
            console.log("✅ Arquivo contracts.ts atualizado");
        }

        console.log("\n================================================");
        console.log("🎉 FRONTEND ATUALIZADO COM SUCESSO!");
        console.log("================================================");
        console.log("📋 Próximos passos:");
        console.log("1. Reinicie o frontend: cd frontend && npm run dev");
        console.log("2. Configure o frontend para usar Metis Sepolia");
        console.log("3. Teste a conectividade com os contratos");
        console.log("");
        console.log("🔍 Verificar contratos em:");
        console.log(`https://hyperion-testnet-explorer.metisdevops.link/address/${addresses.EcosystemHub}`);
        console.log("================================================");

        return true;

    } catch (error) {
        console.error("❌ Erro ao atualizar frontend:", error.message);
        return false;
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    updateFrontendAddresses()
        .then((success) => {
            process.exit(success ? 0 : 1);
        })
        .catch((error) => {
            console.error("❌ Erro:", error);
            process.exit(1);
        });
}

module.exports = updateFrontendAddresses;