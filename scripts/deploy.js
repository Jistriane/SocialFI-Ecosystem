// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy RewardsToken
    console.log("\nDeploying RewardsToken...");
    const RewardsToken = await hre.ethers.getContractFactory("RewardsToken");
    const rewardsToken = await RewardsToken.deploy();
    await rewardsToken.waitForDeployment();
    const rewardsTokenAddress = await rewardsToken.getAddress();
    console.log("RewardsToken deployed to:", rewardsTokenAddress);

    // Deploy TrustChain
    console.log("\nDeploying TrustChain...");
    const TrustChain = await hre.ethers.getContractFactory("TrustChain");
    const trustChain = await TrustChain.deploy();
    await trustChain.waitForDeployment();
    const trustChainAddress = await trustChain.getAddress();
    console.log("TrustChain deployed to:", trustChainAddress);

    // Deploy TradeConnect
    console.log("\nDeploying TradeConnect...");
    const TradeConnect = await hre.ethers.getContractFactory("TradeConnect");
    const tradeConnect = await TradeConnect.deploy(trustChainAddress);
    await tradeConnect.waitForDeployment();
    const tradeConnectAddress = await tradeConnect.getAddress();
    console.log("TradeConnect deployed to:", tradeConnectAddress);

    // Deploy GovGame
    console.log("\nDeploying GovGame...");
    const GovGame = await hre.ethers.getContractFactory("GovGame");
    const govGame = await GovGame.deploy(trustChainAddress, rewardsTokenAddress);
    await govGame.waitForDeployment();
    const govGameAddress = await govGame.getAddress();
    console.log("GovGame deployed to:", govGameAddress);

    // Deploy EcosystemHub
    console.log("\nDeploying EcosystemHub...");
    const EcosystemHub = await hre.ethers.getContractFactory("EcosystemHub");
    const ecosystemHub = await EcosystemHub.deploy(
        trustChainAddress,
        tradeConnectAddress,
        govGameAddress
    );
    await ecosystemHub.waitForDeployment();
    const ecosystemHubAddress = await ecosystemHub.getAddress();
    console.log("EcosystemHub deployed to:", ecosystemHubAddress);

    // Transferir ownership dos contratos para o EcosystemHub
    console.log("\nTransferring ownership to EcosystemHub...");

    await rewardsToken.transferOwnership(ecosystemHubAddress);
    console.log("RewardsToken ownership transferred");

    await trustChain.transferOwnership(ecosystemHubAddress);
    console.log("TrustChain ownership transferred");

    await tradeConnect.transferOwnership(ecosystemHubAddress);
    console.log("TradeConnect ownership transferred");

    await govGame.transferOwnership(ecosystemHubAddress);
    console.log("GovGame ownership transferred");

    console.log("\nDeployment completed!");
    console.log("\nContract Addresses:");
    console.log("-------------------");
    console.log("RewardsToken:", rewardsTokenAddress);
    console.log("TrustChain:", trustChainAddress);
    console.log("TradeConnect:", tradeConnectAddress);
    console.log("GovGame:", govGameAddress);
    console.log("EcosystemHub:", ecosystemHubAddress);

    // Aguardar alguns blocos para garantir que tudo está confirmado
    console.log("\nWaiting for confirmations...");
    await hre.ethers.provider.waitForTransaction(ecosystemHub.deploymentTransaction().hash, 5);
    console.log("Deployment confirmed!");

    // Verificar os contratos no Etherscan
    console.log("\nVerifying contracts on Etherscan...");

    await hre.run("verify:verify", {
        address: rewardsTokenAddress,
        constructorArguments: []
    });

    await hre.run("verify:verify", {
        address: trustChainAddress,
        constructorArguments: []
    });

    await hre.run("verify:verify", {
        address: tradeConnectAddress,
        constructorArguments: [trustChainAddress]
    });

    await hre.run("verify:verify", {
        address: govGameAddress,
        constructorArguments: [trustChainAddress, rewardsTokenAddress]
    });

    await hre.run("verify:verify", {
        address: ecosystemHubAddress,
        constructorArguments: [trustChainAddress, tradeConnectAddress, govGameAddress]
    });

    console.log("\nAll contracts verified on Etherscan!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });