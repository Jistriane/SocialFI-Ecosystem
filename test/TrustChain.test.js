// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TrustChain", function() {
    let TrustChain;
    let trustChain;
    let owner;
    let user1;
    let user2;

    beforeEach(async function() {
        [owner, user1, user2] = await ethers.getSigners();
        TrustChain = await ethers.getContractFactory("TrustChain");
        trustChain = await TrustChain.deploy();
        await trustChain.waitForDeployment();
    });

    describe("Perfil de Usuário", function() {
        it("Deve criar um novo perfil", async function() {
            await trustChain.connect(user1).createProfile("user1");
            const profile = await trustChain.getUserProfile(user1.address);
            expect(profile.username).to.equal("user1");
            expect(profile.isVerified).to.equal(false);
            expect(profile.trustScore).to.equal(100); // INITIAL_TRUST_SCORE
        });

        it("Não deve permitir criar perfil duplicado", async function() {
            await trustChain.connect(user1).createProfile("user1");
            await expect(
                trustChain.connect(user1).createProfile("user1_new")
            ).to.be.revertedWith("TrustChain: Profile already exists");
        });

        it("Deve atualizar um perfil existente", async function() {
            await trustChain.connect(user1).createProfile("user1");
            await trustChain.connect(user1).updateProfile("user1_updated");
            const profile = await trustChain.getUserProfile(user1.address);
            expect(profile.username).to.equal("user1_updated");
        });
    });

    describe("Sistema de Reputação", function() {
        beforeEach(async function() {
            await trustChain.connect(user1).createProfile("user1");
        });

        it("Deve calcular score corretamente", async function() {
            await trustChain.updateMetrics(user1.address, 75);
            const score = await trustChain.calculateScore(user1.address);
            expect(score).to.equal(75);
        });

        it("Apenas owner pode atualizar métricas", async function() {
            await expect(
                trustChain.connect(user2).updateMetrics(user1.address, 50)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Deve validar identidade corretamente", async function() {
            // Inicialmente não verificado
            expect(await trustChain.validateIdentity(user1.address)).to.equal(false);

            // Verificar usuário usando o método correto
            await trustChain.verifyProfile(user1.address);
            expect(await trustChain.validateIdentity(user1.address)).to.equal(true);
        });
    });

    describe("Eventos", function() {
        it("Deve emitir evento ao criar perfil", async function() {
            await expect(trustChain.connect(user1).createProfile("user1"))
                .to.emit(trustChain, "ProfileCreated")
                .withArgs(user1.address, "user1");
        });

        it("Deve emitir evento ao atualizar score", async function() {
            await trustChain.connect(user1).createProfile("user1");
            await expect(trustChain.updateMetrics(user1.address, 80))
                .to.emit(trustChain, "ScoreUpdated")
                .withArgs(user1.address, 80);
        });
    });

    describe("Validações", function() {
        it("Não deve permitir username muito curto", async function() {
            await expect(
                trustChain.connect(user1).createProfile("ab")
            ).to.be.revertedWith("TrustChain: Invalid username length");
        });

        it("Não deve permitir username muito longo", async function() {
            const longUsername = "a".repeat(31);
            await expect(
                trustChain.connect(user1).createProfile(longUsername)
            ).to.be.revertedWith("TrustChain: Invalid username length");
        });

        it("Não deve permitir username duplicado", async function() {
            await trustChain.connect(user1).createProfile("user1");
            await expect(
                trustChain.connect(user2).createProfile("user1")
            ).to.be.revertedWith("TrustChain: Username already taken");
        });

        it("Não deve permitir score acima do máximo", async function() {
            await trustChain.connect(user1).createProfile("user1");
            await expect(
                trustChain.updateMetrics(user1.address, 1001)
            ).to.be.revertedWith("TrustChain: Score exceeds maximum");
        });
    });

    describe("Verificação de Perfil", function() {
        beforeEach(async function() {
            await trustChain.connect(user1).createProfile("user1");
        });

        it("Deve permitir owner verificar perfil", async function() {
            await trustChain.verifyProfile(user1.address);
            const profile = await trustChain.getUserProfile(user1.address);
            expect(profile.isVerified).to.equal(true);
        });

        it("Não deve permitir verificar perfil já verificado", async function() {
            await trustChain.verifyProfile(user1.address);
            await expect(
                trustChain.verifyProfile(user1.address)
            ).to.be.revertedWith("TrustChain: Profile already verified");
        });

        it("Apenas owner pode verificar perfil", async function() {
            await expect(
                trustChain.connect(user2).verifyProfile(user1.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});