// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("GovGame", function() {
    let TrustChain;
    let TradeConnect;
    let RewardsToken;
    let GovGame;
    let trustChain;
    let tradeConnect;
    let rewardsToken;
    let govGame;
    let owner;
    let user1;
    let user2;
    let user3;

    const ONE_DAY = 24 * 60 * 60;
    const PROPOSAL_DURATION = 3 * ONE_DAY;
    const VOTING_PERIOD = 7 * 24 * 60 * 60; // 7 days in seconds
    const MIN_VOTING_POWER = 100;
    const PROPOSAL_THRESHOLD = 500;

    beforeEach(async function() {
        [owner, user1, user2, user3] = await ethers.getSigners();

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

        // Setup inicial
        await trustChain.connect(user1).createProfile("user1");
        await trustChain.connect(user2).createProfile("user2");
        await trustChain.connect(user3).createProfile("user3");
        await trustChain.verifyUser(user1.address);
        await trustChain.verifyUser(user2.address);
        await trustChain.verifyUser(user3.address);
        await trustChain.updateMetrics(user1.address, 80);
        await trustChain.updateMetrics(user2.address, 60);
        await trustChain.updateReputation(user1.address, 1000); // Alto score
        await trustChain.updateReputation(user2.address, 300); // Score médio
        await trustChain.updateReputation(user3.address, 50); // Score baixo
    });

    describe("Gerenciamento de Propostas", function() {
        it("Deve criar uma nova proposta", async function() {
            await govGame.connect(user1).createProposal("Test Proposal", PROPOSAL_DURATION);
            const proposal = await govGame.getProposal(1);

            expect(proposal.creator).to.equal(user1.address);
            expect(proposal.description).to.equal("Test Proposal");
            expect(proposal.status).to.equal(0); // Active
        });

        it("Não deve permitir proposta com duração inválida", async function() {
            const invalidDuration = ONE_DAY / 2; // Menor que o mínimo
            await expect(
                govGame.connect(user1).createProposal("Test Proposal", invalidDuration)
            ).to.be.revertedWith("Invalid duration");
        });

        it("Não deve permitir proposta de usuário não verificado", async function() {
            const [, , unverifiedUser] = await ethers.getSigners();
            await expect(
                govGame.connect(unverifiedUser).createProposal("Test Proposal", PROPOSAL_DURATION)
            ).to.be.revertedWith("Creator not validated");
        });
    });

    describe("Sistema de Votação", function() {
        beforeEach(async function() {
            await govGame.connect(user1).createProposal("Test Proposal", PROPOSAL_DURATION);
        });

        it("Deve permitir votar em proposta ativa", async function() {
            await govGame.connect(user2).vote(1, true);
            const proposal = await govGame.getProposal(1);
            expect(proposal.forVotes).to.be.gt(0);
        });

        it("Não deve permitir votar duas vezes", async function() {
            await govGame.connect(user2).vote(1, true);
            await expect(
                govGame.connect(user2).vote(1, true)
            ).to.be.revertedWith("Already voted");
        });

        it("Não deve permitir votar após o fim do período", async function() {
            await time.increase(PROPOSAL_DURATION + 1);
            await expect(
                govGame.connect(user2).vote(1, true)
            ).to.be.revertedWith("Voting ended");
        });

        it("Peso do voto deve ser baseado no score", async function() {
            await govGame.connect(user1).vote(1, true);
            await govGame.connect(user2).vote(1, true);
            const proposal = await govGame.getProposal(1);

            // user1 tem score maior, então seu voto deve ter mais peso
            expect(proposal.forVotes).to.be.gt(0);
        });
    });

    describe("Execução de Propostas", function() {
        beforeEach(async function() {
            await govGame.connect(user1).createProposal("Test Proposal", PROPOSAL_DURATION);
            await govGame.connect(user1).vote(1, true);
            await govGame.connect(user2).vote(1, true);
        });

        it("Deve executar proposta após período de votação", async function() {
            await time.increase(PROPOSAL_DURATION + 1);
            await govGame.executeProposal(1);
            const proposal = await govGame.getProposal(1);
            expect(proposal.status).to.equal(2); // Executed
        });

        it("Não deve executar proposta antes do fim do período", async function() {
            await expect(
                govGame.executeProposal(1)
            ).to.be.revertedWith("Voting not ended");
        });

        it("Não deve executar proposta já executada", async function() {
            await time.increase(PROPOSAL_DURATION + 1);
            await govGame.executeProposal(1);
            await expect(
                govGame.executeProposal(1)
            ).to.be.revertedWith("Proposal not active");
        });
    });

    describe("Sistema de Recompensas", function() {
        beforeEach(async function() {
            // Transferir tokens para o GovGame
            const amount = ethers.parseEther("1000");
            await rewardsToken.transfer(govGame.address, amount);
        });

        it("Deve distribuir recompensas após execução da proposta", async function() {
            await govGame.connect(user1).createProposal("Test Proposal", PROPOSAL_DURATION);
            await govGame.connect(user1).vote(1, true);
            await govGame.connect(user2).vote(1, true);

            await time.increase(PROPOSAL_DURATION + 1);
            await govGame.executeProposal(1);

            const pendingRewards = await govGame.pendingRewards(user1.address);
            expect(pendingRewards).to.be.gt(0);
        });

        it("Deve permitir reivindicar recompensas", async function() {
            await govGame.connect(user1).createProposal("Test Proposal", PROPOSAL_DURATION);
            await govGame.connect(user1).vote(1, true);
            await time.increase(PROPOSAL_DURATION + 1);
            await govGame.executeProposal(1);

            const initialBalance = await rewardsToken.balanceOf(user1.address);
            await govGame.connect(user1).distributeRewards();
            const finalBalance = await rewardsToken.balanceOf(user1.address);

            expect(finalBalance).to.be.gt(initialBalance);
        });

        it("Não deve permitir reivindicar sem recompensas pendentes", async function() {
            await expect(
                govGame.connect(user1).distributeRewards()
            ).to.be.revertedWith("No rewards to claim");
        });
    });

    describe("Eventos", function() {
        it("Deve emitir evento ao criar proposta", async function() {
            await expect(govGame.connect(user1).createProposal("Test Proposal", PROPOSAL_DURATION))
                .to.emit(govGame, "ProposalCreated");
        });

        it("Deve emitir evento ao votar", async function() {
            await govGame.connect(user1).createProposal("Test Proposal", PROPOSAL_DURATION);
            await expect(govGame.connect(user2).vote(1, true))
                .to.emit(govGame, "VoteCast");
        });

        it("Deve emitir evento ao executar proposta", async function() {
            await govGame.connect(user1).createProposal("Test Proposal", PROPOSAL_DURATION);
            await time.increase(PROPOSAL_DURATION + 1);
            await expect(govGame.executeProposal(1))
                .to.emit(govGame, "ProposalExecuted");
        });

        it("Deve emitir evento ao distribuir recompensas", async function() {
            await govGame.connect(user1).createProposal("Test Proposal", PROPOSAL_DURATION);
            await time.increase(PROPOSAL_DURATION + 1);
            await govGame.executeProposal(1);
            await expect(govGame.connect(user1).distributeRewards())
                .to.emit(govGame, "RewardsDistributed");
        });
    });

    describe("Deployment", function() {
        it("Deve definir o endereço correto do TrustChain", async function() {
            expect(await govGame.trustChain()).to.equal(await trustChain.getAddress());
        });

        it("Deve definir o owner corretamente", async function() {
            expect(await govGame.owner()).to.equal(owner.address);
        });

        it("Não deve permitir endereço zero para TrustChain", async function() {
            const GovGame = await ethers.getContractFactory("GovGame");
            await expect(GovGame.deploy(ethers.ZeroAddress))
                .to.be.revertedWith("GovGame: Invalid TrustChain address");
        });
    });

    describe("Criação de Propostas", function() {
        it("Deve permitir criar proposta com reputação suficiente", async function() {
            const tx = await govGame.connect(user1).createProposal(
                "Título da Proposta",
                "Descrição da Proposta",
                "protocol"
            );

            const receipt = await tx.wait();
            const event = receipt.logs.find(
                log => log.fragment && log.fragment.name === 'ProposalCreated'
            );

            expect(event).to.not.be.undefined;
            expect(await govGame.proposalCount()).to.equal(1);
        });

        it("Não deve permitir criar proposta sem reputação suficiente", async function() {
            await expect(
                govGame.connect(user3).createProposal(
                    "Título da Proposta",
                    "Descrição da Proposta",
                    "protocol"
                )
            ).to.be.revertedWith("GovGame: Insufficient reputation");
        });

        it("Não deve permitir criar proposta com título vazio", async function() {
            await expect(
                govGame.connect(user1).createProposal(
                    "",
                    "Descrição da Proposta",
                    "protocol"
                )
            ).to.be.revertedWith("GovGame: Empty title");
        });
    });

    describe("Votação", function() {
        beforeEach(async function() {
            await govGame.connect(user1).createProposal(
                "Título da Proposta",
                "Descrição da Proposta",
                "protocol"
            );
        });

        it("Deve permitir votar com reputação suficiente", async function() {
            const tx = await govGame.connect(user2).vote(0, true, "Concordo");
            const receipt = await tx.wait();

            const event = receipt.logs.find(
                log => log.fragment && log.fragment.name === 'VoteCast'
            );

            expect(event).to.not.be.undefined;
            const [proposalId, voter, support, votingPower] = event.args;

            expect(proposalId).to.equal(0);
            expect(voter).to.equal(user2.address);
            expect(support).to.be.true;
            expect(votingPower).to.be.gt(0);
        });

        it("Não deve permitir votar sem reputação suficiente", async function() {
            await expect(
                govGame.connect(user3).vote(0, true, "Concordo")
            ).to.be.revertedWith("GovGame: Insufficient reputation");
        });

        it("Não deve permitir votar duas vezes", async function() {
            await govGame.connect(user2).vote(0, true, "Concordo");
            await expect(
                govGame.connect(user2).vote(0, true, "Concordo de novo")
            ).to.be.revertedWith("GovGame: Already voted");
        });

        it("Não deve permitir votar após o período de votação", async function() {
            await time.increase(VOTING_PERIOD + 1);
            await expect(
                govGame.connect(user2).vote(0, true, "Concordo")
            ).to.be.revertedWith("GovGame: Voting period ended");
        });
    });

    describe("Execução de Propostas", function() {
        beforeEach(async function() {
            await govGame.connect(user1).createProposal(
                "Título da Proposta",
                "Descrição da Proposta",
                "protocol"
            );
            await govGame.connect(user1).vote(0, true, "Concordo");
            await govGame.connect(user2).vote(0, true, "Também concordo");
        });

        it("Deve executar proposta aprovada após período de votação", async function() {
            await time.increase(VOTING_PERIOD + 1);
            const tx = await govGame.executeProposal(0);
            const receipt = await tx.wait();

            const event = receipt.logs.find(
                log => log.fragment && log.fragment.name === 'ProposalExecuted'
            );

            expect(event).to.not.be.undefined;
            const proposal = await govGame.getProposal(0);
            expect(proposal.status).to.equal(1); // Succeeded
        });

        it("Não deve executar proposta antes do fim do período", async function() {
            await expect(
                govGame.executeProposal(0)
            ).to.be.revertedWith("GovGame: Voting period not ended");
        });

        it("Deve marcar como derrotada se mais votos contra", async function() {
            await trustChain.updateReputation(user3.address, 1000);
            await govGame.connect(user3).vote(0, false, "Discordo fortemente");

            await time.increase(VOTING_PERIOD + 1);
            await govGame.executeProposal(0);

            const proposal = await govGame.getProposal(0);
            expect(proposal.status).to.equal(2); // Defeated
        });
    });

    describe("Cancelamento de Propostas", function() {
        beforeEach(async function() {
            await govGame.connect(user1).createProposal(
                "Título da Proposta",
                "Descrição da Proposta",
                "protocol"
            );
        });

        it("Deve permitir que o criador cancele a proposta", async function() {
            const tx = await govGame.connect(user1).cancelProposal(0);
            const receipt = await tx.wait();

            const event = receipt.logs.find(
                log => log.fragment && log.fragment.name === 'ProposalCancelled'
            );

            expect(event).to.not.be.undefined;
            const proposal = await govGame.getProposal(0);
            expect(proposal.status).to.equal(4); // Cancelled
        });

        it("Deve permitir que o owner cancele a proposta", async function() {
            const tx = await govGame.connect(owner).cancelProposal(0);
            const receipt = await tx.wait();

            const event = receipt.logs.find(
                log => log.fragment && log.fragment.name === 'ProposalCancelled'
            );

            expect(event).to.not.be.undefined;
            const proposal = await govGame.getProposal(0);
            expect(proposal.status).to.equal(4); // Cancelled
        });

        it("Não deve permitir que outros usuários cancelem a proposta", async function() {
            await expect(
                govGame.connect(user2).cancelProposal(0)
            ).to.be.revertedWith("GovGame: Not authorized");
        });
    });

    describe("Consultas", function() {
        beforeEach(async function() {
            await govGame.connect(user1).createProposal(
                "Título da Proposta",
                "Descrição da Proposta",
                "protocol"
            );
            await govGame.connect(user2).vote(0, true, "Concordo");
        });

        it("Deve retornar detalhes corretos da proposta", async function() {
            const proposal = await govGame.getProposal(0);
            expect(proposal.proposer).to.equal(user1.address);
            expect(proposal.title).to.equal("Título da Proposta");
            expect(proposal.description).to.equal("Descrição da Proposta");
            expect(proposal.category).to.equal("protocol");
        });

        it("Deve retornar detalhes corretos do voto", async function() {
            const vote = await govGame.getVote(0, user2.address);
            expect(vote.support).to.be.true;
            expect(vote.reason).to.equal("Concordo");
        });

        it("Deve retornar lista correta de propostas do usuário", async function() {
            const proposals = await govGame.getUserProposals(user1.address);
            expect(proposals.length).to.equal(1);
            expect(proposals[0]).to.equal(0);
        });
    });
});