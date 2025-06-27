// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RewardsToken", function() {
    let RewardsToken;
    let rewardsToken;
    let owner;
    let user1;
    let user2;

    beforeEach(async function() {
        [owner, user1, user2] = await ethers.getSigners();
        RewardsToken = await ethers.getContractFactory("RewardsToken");
        rewardsToken = await RewardsToken.deploy(); // Sem parâmetros
        await rewardsToken.waitForDeployment();
    });

    describe("Implantação", function() {
        it("Deve definir o nome e símbolo corretos", async function() {
            expect(await rewardsToken.name()).to.equal("SocialFI Rewards");
            expect(await rewardsToken.symbol()).to.equal("SFR");
        });

        it("Deve ter 18 decimais", async function() {
            expect(await rewardsToken.decimals()).to.equal(18);
        });

        it("Deve ter supply inicial zero", async function() {
            expect(await rewardsToken.totalSupply()).to.equal(0);
        });
    });

    describe("Mint de Tokens", function() {
        it("Deve permitir owner mintar tokens", async function() {
            const amount = ethers.parseEther("100");
            await rewardsToken.mint(user1.address, amount);

            expect(await rewardsToken.balanceOf(user1.address)).to.equal(amount);
            expect(await rewardsToken.totalSupply()).to.equal(amount);
        });

        it("Não deve permitir mint para endereço zero", async function() {
            const amount = ethers.parseEther("100");
            await expect(
                rewardsToken.mint(ethers.ZeroAddress, amount)
            ).to.be.revertedWith("RewardsToken: mint to zero address");
        });

        it("Não deve permitir mint de valor zero", async function() {
            await expect(
                rewardsToken.mint(user1.address, 0)
            ).to.be.revertedWith("RewardsToken: amount must be positive");
        });

        it("Apenas owner pode mintar", async function() {
            const amount = ethers.parseEther("100");
            await expect(
                rewardsToken.connect(user1).mint(user2.address, amount)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Transferências", function() {
        const amount = ethers.parseEther("100");

        beforeEach(async function() {
            await rewardsToken.mint(user1.address, amount);
        });

        it("Deve transferir tokens entre contas", async function() {
            const transferAmount = ethers.parseEther("50");
            await rewardsToken.connect(user1).transfer(user2.address, transferAmount);

            expect(await rewardsToken.balanceOf(user1.address)).to.equal(amount - transferAmount);
            expect(await rewardsToken.balanceOf(user2.address)).to.equal(transferAmount);
        });

        it("Deve falhar se remetente não tem saldo suficiente", async function() {
            const transferAmount = ethers.parseEther("200");
            await expect(
                rewardsToken.connect(user1).transfer(user2.address, transferAmount)
            ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });

        it("Deve emitir evento Transfer", async function() {
            const transferAmount = ethers.parseEther("50");
            await expect(rewardsToken.connect(user1).transfer(user2.address, transferAmount))
                .to.emit(rewardsToken, "Transfer")
                .withArgs(user1.address, user2.address, transferAmount);
        });
    });

    describe("Allowances", function() {
        const amount = ethers.parseEther("100");

        beforeEach(async function() {
            await rewardsToken.mint(user1.address, amount);
        });

        it("Deve aprovar allowance", async function() {
            await rewardsToken.connect(user1).approve(user2.address, amount);
            expect(await rewardsToken.allowance(user1.address, user2.address))
                .to.equal(amount);
        });

        it("Deve permitir transferFrom quando aprovado", async function() {
            await rewardsToken.connect(user1).approve(user2.address, amount);
            await rewardsToken.connect(user2).transferFrom(user1.address, user2.address, amount);

            expect(await rewardsToken.balanceOf(user2.address)).to.equal(amount);
            expect(await rewardsToken.balanceOf(user1.address)).to.equal(0);
        });

        it("Não deve permitir transferFrom acima do allowance", async function() {
            await rewardsToken.connect(user1).approve(user2.address, amount);
            await expect(
                rewardsToken.connect(user2).transferFrom(
                    user1.address,
                    user2.address,
                    amount + 1n
                )
            ).to.be.revertedWith("ERC20: insufficient allowance");
        });

        it("Deve emitir evento Approval", async function() {
            await expect(rewardsToken.connect(user1).approve(user2.address, amount))
                .to.emit(rewardsToken, "Approval")
                .withArgs(user1.address, user2.address, amount);
        });
    });

    describe("Queima de Tokens", function() {
        const amount = ethers.parseEther("100");

        beforeEach(async function() {
            await rewardsToken.mint(user1.address, amount);
        });

        it("Deve permitir owner queimar tokens", async function() {
            await rewardsToken.burn(user1.address, amount);
            expect(await rewardsToken.balanceOf(user1.address)).to.equal(0);
        });

        it("Não deve permitir queimar mais que o saldo", async function() {
            await expect(
                rewardsToken.burn(user1.address, amount + 1n)
            ).to.be.revertedWith("RewardsToken: insufficient balance");
        });

        it("Deve reduzir o supply total após queima", async function() {
            const initialSupply = await rewardsToken.totalSupply();
            await rewardsToken.burn(user1.address, amount);
            const finalSupply = await rewardsToken.totalSupply();
            expect(finalSupply).to.equal(initialSupply - amount);
        });

        it("Deve emitir evento TokensBurned", async function() {
            await expect(rewardsToken.burn(user1.address, amount))
                .to.emit(rewardsToken, "TokensBurned")
                .withArgs(user1.address, amount);
        });

        it("Apenas owner pode queimar tokens", async function() {
            await expect(
                rewardsToken.connect(user1).burn(user1.address, amount)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Controle de Acesso", function() {
        it("Deve ter owner correto após deploy", async function() {
            expect(await rewardsToken.owner()).to.equal(owner.address);
        });

        it("Deve permitir transferência de ownership", async function() {
            await rewardsToken.transferOwnership(user1.address);
            expect(await rewardsToken.owner()).to.equal(user1.address);
        });

        it("Apenas owner pode transferir ownership", async function() {
            await expect(
                rewardsToken.connect(user1).transferOwnership(user2.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});