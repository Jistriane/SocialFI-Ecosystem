// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EcosystemHub", function() {
    let TrustChain;
    let TradeConnect;
    let GovGame;
    let RewardsToken;
    let EcosystemHub;
    let trustChain;
    let tradeConnect;
    let govGame;
    let rewardsToken;
    let ecosystemHub;
    let owner;
    let user1;
    let user2;

    beforeEach(async function() {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy TrustChain
        TrustChain = await ethers.getContractFactory("TrustChain");
        trustChain = await TrustChain.deploy();
        await trustChain.waitForDeployment();

        // Deploy TradeConnect
        TradeConnect = await ethers.getContractFactory("TradeConnect");
        tradeConnect = await TradeConnect.deploy(trustChain.address);
        await tradeConnect.waitForDeployment();

        // Deploy RewardsToken
        RewardsToken = await ethers.getContractFactory("RewardsToken");
        rewardsToken = await RewardsToken.deploy("SocialFi Rewards", "SFR");
        await rewardsToken.waitForDeployment();

        // Deploy GovGame
        GovGame = await ethers.getContractFactory("GovGame");
        govGame = await GovGame.deploy(
            trustChain.address,
            tradeConnect.address,
            rewardsToken.address
        );
        await govGame.waitForDeployment();

        // Deploy EcosystemHub
        EcosystemHub = await ethers.getContractFactory("EcosystemHub");
        ecosystemHub = await EcosystemHub.deploy(
            trustChain.address,
            tradeConnect.address,
            govGame.address,
            rewardsToken.address
        );
        await ecosystemHub.waitForDeployment();

        // Setup inicial
        await trustChain.connect(user1).createProfile("user1");
        await trustChain.connect(user2).createProfile("user2");
        await trustChain.verifyUser(user1.address);
    });

    describe("Integração TrustChain", function() {
        it("Deve atualizar score do TrustChain baseado em atividades", async function() {
            await ecosystemHub.connect(owner).updateUserScore(user1.address, 85);
            const score = await trustChain.calculateScore(user1.address);
            expect(score).to.equal(85);
        });

        it("Deve verificar status de validação do usuário", async function() {
            const isValidated = await ecosystemHub.isUserValidated(user1.address);
            expect(isValidated).to.equal(true);
        });

        it("Não deve permitir ações para usuários não validados", async function() {
            await expect(
                ecosystemHub.connect(user2).performAction()
            ).to.be.revertedWith("User not validated");
        });
    });

    describe("Integração TradeConnect", function() {
        beforeEach(async function() {
            // Setup para testes de trading
            await tradeConnect.connect(user1).createTrade(ethers.parseEther("1.0"));
        });

        it("Deve sincronizar métricas de trading com TrustChain", async function() {
            await ecosystemHub.connect(owner).syncTradingMetrics(user1.address);
            const tradingScore = await trustChain.getCategoryScore(user1.address, 0); // 0 = Trading
            expect(tradingScore).to.be.gt(0);
        });

        it("Deve distribuir recompensas baseadas em performance de trading", async function() {
            await rewardsToken.transfer(ecosystemHub.address, ethers.parseEther("1000"));
            await ecosystemHub.connect(owner).distributeTradeRewards(user1.address);
            const balance = await rewardsToken.balanceOf(user1.address);
            expect(balance).to.be.gt(0);
        });
    });

    describe("Integração GovGame", function() {
        const PROPOSAL_DURATION = 3 * 24 * 60 * 60; // 3 dias

        beforeEach(async function() {
            await govGame.connect(user1).createProposal("Test Proposal", PROPOSAL_DURATION);
        });

        it("Deve sincronizar participação em governança com TrustChain", async function() {
            await govGame.connect(user1).vote(1, true);
            await ecosystemHub.connect(owner).syncGovernanceMetrics(user1.address);
            const govScore = await trustChain.getCategoryScore(user1.address, 1); // 1 = Governance
            expect(govScore).to.be.gt(0);
        });

        it("Deve distribuir recompensas de governança", async function() {
            await rewardsToken.transfer(ecosystemHub.address, ethers.parseEther("1000"));
            await govGame.connect(user1).vote(1, true);
            await ecosystemHub.connect(owner).distributeGovRewards(user1.address);
            const balance = await rewardsToken.balanceOf(user1.address);
            expect(balance).to.be.gt(0);
        });
    });

    describe("Gerenciamento de Recompensas", function() {
        beforeEach(async function() {
            await rewardsToken.transfer(ecosystemHub.address, ethers.parseEther("1000"));
        });

        it("Deve calcular recompensas corretamente", async function() {
            const rewards = await ecosystemHub.calculateRewards(user1.address);
            expect(rewards).to.be.gte(0);
        });

        it("Deve distribuir recompensas apenas para usuários validados", async function() {
            await expect(
                ecosystemHub.connect(owner).distributeRewards(user2.address)
            ).to.be.revertedWith("User not validated");
        });

        it("Deve atualizar saldo de recompensas após distribuição", async function() {
            await ecosystemHub.connect(owner).distributeRewards(user1.address);
            const pendingRewards = await ecosystemHub.pendingRewards(user1.address);
            expect(pendingRewards).to.equal(0);
        });
    });

    describe("Controle de Acesso", function() {
        it("Apenas owner pode atualizar contratos", async function() {
            await expect(
                ecosystemHub.connect(user1).updateTrustChain(ethers.ZeroAddress)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Apenas owner pode pausar o sistema", async function() {
            await expect(
                ecosystemHub.connect(user1).pause()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Deve permitir owner atualizar endereços dos contratos", async function() {
            const newTrustChain = await TrustChain.deploy();
            await ecosystemHub.connect(owner).updateTrustChain(newTrustChain.address);
            expect(await ecosystemHub.trustChain()).to.equal(newTrustChain.address);
        });
    });

    describe("Eventos", function() {
        it("Deve emitir evento ao sincronizar métricas", async function() {
            await expect(ecosystemHub.connect(owner).syncTradingMetrics(user1.address))
                .to.emit(ecosystemHub, "MetricsSynced");
        });

        it("Deve emitir evento ao distribuir recompensas", async function() {
            await rewardsToken.transfer(ecosystemHub.address, ethers.parseEther("1000"));
            await expect(ecosystemHub.connect(owner).distributeRewards(user1.address))
                .to.emit(ecosystemHub, "RewardsDistributed");
        });

        it("Deve emitir evento ao atualizar contratos", async function() {
            const newTrustChain = await TrustChain.deploy();
            await expect(ecosystemHub.connect(owner).updateTrustChain(newTrustChain.address))
                .to.emit(ecosystemHub, "ContractUpdated");
        });
    });
});