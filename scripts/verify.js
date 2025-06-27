// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const hre = require("hardhat");
const fs = require("fs");

async function main() {
  // Carregar endereços dos contratos
  const network = hre.network.name;
  const deploymentPath = `deployments/${network}.json`;
  
  if (!fs.existsSync(deploymentPath)) {
    console.error(`Arquivo de deployment não encontrado para a rede ${network}`);
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contracts = deployment.contracts;

  console.log(`Verificando contratos na rede ${network}...\n`);

  try {
    // Verificar RewardsToken
    console.log("Verificando RewardsToken...");
    await hre.run("verify:verify", {
      address: contracts.RewardsToken,
      constructorArguments: []
    });

    // Verificar TrustChain
    console.log("\nVerificando TrustChain...");
    await hre.run("verify:verify", {
      address: contracts.TrustChain,
      constructorArguments: []
    });

    // Verificar TradeConnect
    console.log("\nVerificando TradeConnect...");
    await hre.run("verify:verify", {
      address: contracts.TradeConnect,
      constructorArguments: [contracts.RewardsToken]
    });

    // Verificar GovGame
    console.log("\nVerificando GovGame...");
    await hre.run("verify:verify", {
      address: contracts.GovGame,
      constructorArguments: [contracts.RewardsToken]
    });

    // Verificar EcosystemHub
    console.log("\nVerificando EcosystemHub...");
    await hre.run("verify:verify", {
      address: contracts.EcosystemHub,
      constructorArguments: [
        contracts.RewardsToken,
        contracts.TrustChain,
        contracts.TradeConnect,
        contracts.GovGame
      ]
    });

    console.log("\nTodos os contratos foram verificados com sucesso!");
  } catch (error) {
    console.error("Erro durante a verificação:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
