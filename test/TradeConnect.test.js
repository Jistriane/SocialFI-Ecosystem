// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TradeConnect", function() {
    let TrustChain;
    let TradeConnect;
    let trustChain;
    let tradeConnect;
    let owner;
    let trader1;
    let trader2;

    beforeEach(async function() {
        [owner, trader1, trader2] = await ethers.getSigners();

        // Deploy TrustChain primeiro
        TrustChain = await ethers.getContractFactory("TrustChain");
        trustChain = await TrustChain.deploy();
        await trustChain.waitForDeployment();

        // Deploy TradeConnect com referência ao TrustChain
        TradeConnect = await ethers.getContractFactory("TradeConnect");
        tradeConnect = await TradeConnect.deploy(trustChain.address);
        await tradeConnect.waitForDeployment();

        // Criar perfis e verificar traders
        await trustChain.connect(trader1).createProfile("trader1");
        await trustChain.connect(trader2).createProfile("trader2");
        await trustChain.verifyUser(trader1.address);
        await trustChain.verifyUser(trader2.address);
    });

    describe("Gerenciamento de Trades", function() {
        it("Deve criar um novo trade", async function() {
            const amount = ethers.parseEther("1.0");
            await tradeConnect.connect(trader1).createTrade(amount);

            const trades = await tradeConnect.getActiveTrades(trader1.address);
            expect(trades.length).to.equal(1);
            expect(trades[0].trader).to.equal(trader1.address);
            expect(trades[0].amount).to.equal(amount);
            expect(trades[0].isActive).to.equal(true);
        });

        it("Não deve permitir trade com valor zero", async function() {
            await expect(
                tradeConnect.connect(trader1).createTrade(0)
            ).to.be.revertedWith("Amount must be greater than 0");
        });

        it("Deve fechar um trade ativo", async function() {
            const amount = ethers.parseEther("1.0");
            await tradeConnect.connect(trader1).createTrade(amount);
            const trades = await tradeConnect.getActiveTrades(trader1.address);
            const tradeId = trades[0].id;

            await tradeConnect.connect(trader1).closeTrade(tradeId);
            const updatedTrades = await tradeConnect.getActiveTrades(trader1.address);
            expect(updatedTrades.length).to.equal(0);
        });

        it("Não deve permitir fechar trade de outro trader", async function() {
            const amount = ethers.parseEther("1.0");
            await tradeConnect.connect(trader1).createTrade(amount);
            const trades = await tradeConnect.getActiveTrades(trader1.address);
            const tradeId = trades[0].id;

            await expect(
                tradeConnect.connect(trader2).closeTrade(tradeId)
            ).to.be.revertedWith("Not trade owner");
        });
    });

    describe("Copy Trading", function() {
        it("Deve permitir copy trade de trader verificado", async function() {
            await tradeConnect.connect(trader2).copyTrade(trader1.address);
            // Verificar evento emitido
            // Implementação completa depende da lógica específica de copy trade
        });

        it("Não deve permitir copy trade de si mesmo", async function() {
            await expect(
                tradeConnect.connect(trader1).copyTrade(trader1.address)
            ).to.be.revertedWith("Cannot copy own trades");
        });

        it("Não deve permitir copy trade de trader não verificado", async function() {
            const [, , unverifiedTrader] = await ethers.getSigners();
            await expect(
                tradeConnect.connect(trader1).copyTrade(unverifiedTrader.address)
            ).to.be.revertedWith("Trader not validated");
        });
    });

    describe("Rankings e Performance", function() {
        it("Deve atualizar ranking do trader", async function() {
            const newRanking = 85;
            await tradeConnect.connect(owner).updatePerformance(trader1.address, ethers.parseEther("10"));
            const ranking = await tradeConnect.getRanking(trader1.address);
            expect(ranking).to.be.gt(0);
        });

        it("Apenas owner pode atualizar performance", async function() {
            await expect(
                tradeConnect.connect(trader1).updatePerformance(trader1.address, ethers.parseEther("10"))
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Deve retornar estatísticas corretas do trader", async function() {
            const amount = ethers.parseEther("1.0");
            await tradeConnect.connect(trader1).createTrade(amount);

            const stats = await tradeConnect.getTraderStats(trader1.address);
            expect(stats.totalTrades).to.equal(1);
            expect(stats.totalVolume).to.equal(amount);
        });
    });

    describe("Eventos", function() {
        it("Deve emitir evento ao criar trade", async function() {
            const amount = ethers.parseEther("1.0");
            await expect(tradeConnect.connect(trader1).createTrade(amount))
                .to.emit(tradeConnect, "TradeCreated");
        });

        it("Deve emitir evento ao fechar trade", async function() {
            const amount = ethers.parseEther("1.0");
            await tradeConnect.connect(trader1).createTrade(amount);
            const trades = await tradeConnect.getActiveTrades(trader1.address);
            const tradeId = trades[0].id;

            await expect(tradeConnect.connect(trader1).closeTrade(tradeId))
                .to.emit(tradeConnect, "TradeClosed");
        });

        it("Deve emitir evento ao atualizar ranking", async function() {
            await expect(
                tradeConnect.connect(owner).updatePerformance(trader1.address, ethers.parseEther("10"))
            ).to.emit(tradeConnect, "TraderRankingUpdated");
        });
    });
});