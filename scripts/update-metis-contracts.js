// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const fs = require('fs');
const path = require('path');

// Endereços dos contratos na Metis Sepolia (quando deployados)
const METIS_CONTRACTS = {
    RewardsToken: "0x0000000000000000000000000000000000000000", // Placeholder
    TrustChain: "0x0000000000000000000000000000000000000000", // Placeholder
    TradeConnect: "0x0000000000000000000000000000000000000000", // Placeholder
    GovGame: "0x0000000000000000000000000000000000000000", // Placeholder
    EcosystemHub: "0x0000000000000000000000000000000000000000" // Placeholder
};

function updateContractsConfig(metisAddresses) {
    const contractsPath = path.join(__dirname, '../frontend/src/config/contracts.ts');

    try {
        let content = fs.readFileSync(contractsPath, 'utf8');

        // Atualiza os endereços da Metis Sepolia
        const metisSection = `  // Metis Sepolia - Contratos deployados
  133717: {
    RewardsToken: "${metisAddresses.RewardsToken}",
    TrustChain: "${metisAddresses.TrustChain}",
    TradeConnect: "${metisAddresses.TradeConnect}",
    GovGame: "${metisAddresses.GovGame}",
    EcosystemHub: "${metisAddresses.EcosystemHub}"
  }`;

        // Substitui a seção da Metis Sepolia
        content = content.replace(
            /\/\/ Metis Sepolia.*?\n  133717: \{[\s\S]*?\}/,
            metisSection
        );

        fs.writeFileSync(contractsPath, content);
        console.log('✅ Endereços dos contratos da Metis Sepolia atualizados!');

        // Atualiza também o NetworkSelector
        updateNetworkSelector(true);

    } catch (error) {
        console.error('❌ Erro ao atualizar contratos:', error);
    }
}

function updateNetworkSelector(hasContracts = false) {
    const networkSelectorPath = path.join(__dirname, '../frontend/src/components/NetworkSelector/index.tsx');

    try {
        let content = fs.readFileSync(networkSelectorPath, 'utf8');

        // Atualiza o status dos contratos na Metis
        const newStatus = hasContracts ? 'true' : 'false';
        const newInfo = hasContracts ? 'Contratos deployados e funcionais' : 'Contratos ainda não deployados';

        content = content.replace(
            /id: 133717,[\s\S]*?contractsInfo: '[^']*'/,
            `id: 133717,
    name: 'Metis Sepolia',
    symbol: 'tMETIS',
    rpcUrl: 'https://hyperion-testnet.metisdevops.link',
    explorerUrl: 'https://hyperion-testnet-explorer.metisdevops.link',
    hasContracts: ${newStatus},
    contractsInfo: '${newInfo}'`
        );

        fs.writeFileSync(networkSelectorPath, content);
        console.log('✅ Status da rede Metis Sepolia atualizado!');

    } catch (error) {
        console.error('❌ Erro ao atualizar NetworkSelector:', error);
    }
}

// Função principal
function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('📋 Uso: node update-metis-contracts.js [deploy-info.json]');
        console.log('   ou: node update-metis-contracts.js RewardsToken=0x123... TrustChain=0x456...');
        return;
    }

    let addresses = {...METIS_CONTRACTS };

    // Se foi passado um arquivo JSON
    if (args[0].endsWith('.json')) {
        try {
            const deployInfo = JSON.parse(fs.readFileSync(args[0], 'utf8'));
            addresses = {...addresses, ...deployInfo };
        } catch (error) {
            console.error('❌ Erro ao ler arquivo JSON:', error);
            return;
        }
    }
    // Se foram passados endereços individuais
    else {
        args.forEach(arg => {
            const [contract, address] = arg.split('=');
            if (contract && address && addresses.hasOwnProperty(contract)) {
                addresses[contract] = address;
            }
        });
    }

    console.log('🚀 Atualizando endereços dos contratos na Metis Sepolia...');
    console.log('📋 Endereços:');
    Object.entries(addresses).forEach(([name, address]) => {
        console.log(`   ${name}: ${address}`);
    });

    updateContractsConfig(addresses);

    // Verifica se todos os contratos foram deployados
    const allDeployed = Object.values(addresses).every(addr =>
        addr !== "0x0000000000000000000000000000000000000000"
    );

    if (allDeployed) {
        console.log('🎉 Todos os contratos foram deployados na Metis Sepolia!');
        updateNetworkSelector(true);
    } else {
        console.log('⚠️  Alguns contratos ainda precisam ser deployados.');
    }
}

if (require.main === module) {
    main();
}

module.exports = { updateContractsConfig, updateNetworkSelector };