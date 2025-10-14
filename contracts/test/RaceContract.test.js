const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RaceContract", function () {
  let raceContract;
  let owner, player1, player2, player3;
  const entryFee = ethers.parseEther("0.1");
  const maxPlayers = 4;

  beforeEach(async function () {
    [owner, player1, player2, player3] = await ethers.getSigners();
    
    const RaceContract = await ethers.getContractFactory("RaceContract");
    raceContract = await RaceContract.deploy();
    await raceContract.waitForDeployment();
  });

  describe("Race Creation", function () {
    it("Should create a race", async function () {
      const tx = await raceContract.createRace(entryFee, maxPlayers);
      const receipt = await tx.wait();
      
      const race = await raceContract.getRace(1);
      expect(race.entryFee).to.equal(entryFee);
      expect(race.maxPlayers).to.equal(maxPlayers);
      expect(race.currentPlayers).to.equal(0);
      expect(race.started).to.equal(false);
      expect(race.finalized).to.equal(false);
    });

    it("Should fail to create race with 0 entry fee", async function () {
      await expect(
        raceContract.createRace(0, maxPlayers)
      ).to.be.revertedWith("Entry fee must be greater than 0");
    });

    it("Should fail to create race with invalid max players", async function () {
      await expect(
        raceContract.createRace(entryFee, 1)
      ).to.be.revertedWith("Max players must be between 2 and 10");
    });
  });

  describe("Joining Races", function () {
    beforeEach(async function () {
      await raceContract.createRace(entryFee, maxPlayers);
    });

    it("Should allow player to join race", async function () {
      await expect(
        raceContract.connect(player1).joinRace(1, 123, { value: entryFee })
      ).to.emit(raceContract, "RaceJoined");
      
      const race = await raceContract.getRace(1);
      expect(race.currentPlayers).to.equal(1);
      expect(race.totalPot).to.equal(entryFee);
    });

    it("Should fail to join with incorrect entry fee", async function () {
      await expect(
        raceContract.connect(player1).joinRace(1, 123, { value: ethers.parseEther("0.05") })
      ).to.be.revertedWith("Incorrect entry fee");
    });

    it("Should fail to join non-existent race", async function () {
      await expect(
        raceContract.connect(player1).joinRace(999, 123, { value: entryFee })
      ).to.be.revertedWith("Race does not exist");
    });

    it("Should fail to join same race twice", async function () {
      await raceContract.connect(player1).joinRace(1, 123, { value: entryFee });
      
      await expect(
        raceContract.connect(player1).joinRace(1, 456, { value: entryFee })
      ).to.be.revertedWith("Already joined this race");
    });

    it("Should allow multiple players to join", async function () {
      await raceContract.connect(player1).joinRace(1, 1, { value: entryFee });
      await raceContract.connect(player2).joinRace(1, 2, { value: entryFee });
      await raceContract.connect(player3).joinRace(1, 3, { value: entryFee });
      
      const race = await raceContract.getRace(1);
      expect(race.currentPlayers).to.equal(3);
      expect(race.totalPot).to.equal(entryFee * 3n);
    });
  });

  describe("Starting Races", function () {
    beforeEach(async function () {
      await raceContract.createRace(entryFee, maxPlayers);
      await raceContract.connect(player1).joinRace(1, 1, { value: entryFee });
      await raceContract.connect(player2).joinRace(1, 2, { value: entryFee });
    });

    it("Should start race with enough players", async function () {
      await expect(raceContract.startRace(1))
        .to.emit(raceContract, "RaceStarted");
      
      const race = await raceContract.getRace(1);
      expect(race.started).to.equal(true);
    });

    it("Should fail to start race without enough players", async function () {
      await raceContract.createRace(entryFee, maxPlayers);
      await raceContract.connect(player1).joinRace(2, 1, { value: entryFee });
      
      await expect(
        raceContract.startRace(2)
      ).to.be.revertedWith("Not enough players");
    });

    it("Should fail to join after race started", async function () {
      await raceContract.startRace(1);
      
      await expect(
        raceContract.connect(player3).joinRace(1, 3, { value: entryFee })
      ).to.be.revertedWith("Race already started");
    });
  });

  describe("Finalizing Races", function () {
    beforeEach(async function () {
      await raceContract.createRace(entryFee, maxPlayers);
      await raceContract.connect(player1).joinRace(1, 1, { value: entryFee });
      await raceContract.connect(player2).joinRace(1, 2, { value: entryFee });
      await raceContract.startRace(1);
    });

    it("Should finalize race and credit winner", async function () {
      await expect(raceContract.finalizeRace(1, 0))
        .to.emit(raceContract, "RaceFinalized");
      
      const race = await raceContract.getRace(1);
      expect(race.finalized).to.equal(true);
      expect(race.winner).to.equal(0);
      
      // Check winner balance (95% of pot)
      const expectedPayout = (entryFee * 2n * 95n) / 100n;
      const winnerBalance = await raceContract.getBalance(player1.address);
      expect(winnerBalance).to.equal(expectedPayout);
      
      // Check platform fee (5% of pot)
      const expectedFee = (entryFee * 2n * 5n) / 100n;
      const feeCollectorBalance = await raceContract.getBalance(owner.address);
      expect(feeCollectorBalance).to.equal(expectedFee);
    });

    it("Should fail to finalize with invalid winner index", async function () {
      await expect(
        raceContract.finalizeRace(1, 5)
      ).to.be.revertedWith("Invalid winner index");
    });

    it("Should fail to finalize twice", async function () {
      await raceContract.finalizeRace(1, 0);
      
      await expect(
        raceContract.finalizeRace(1, 1)
      ).to.be.revertedWith("Race already finalized");
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      await raceContract.createRace(entryFee, maxPlayers);
      await raceContract.connect(player1).joinRace(1, 1, { value: entryFee });
      await raceContract.connect(player2).joinRace(1, 2, { value: entryFee });
      await raceContract.startRace(1);
      await raceContract.finalizeRace(1, 0);
    });

    it("Should allow winner to withdraw", async function () {
      const balanceBefore = await ethers.provider.getBalance(player1.address);
      const winnings = await raceContract.getBalance(player1.address);
      
      const tx = await raceContract.connect(player1).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const balanceAfter = await ethers.provider.getBalance(player1.address);
      expect(balanceAfter).to.equal(balanceBefore + winnings - gasUsed);
    });

    it("Should fail to withdraw with no balance", async function () {
      await expect(
        raceContract.connect(player2).withdraw()
      ).to.be.revertedWith("No balance to withdraw");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update platform fee", async function () {
      await raceContract.setPlatformFee(10);
      expect(await raceContract.platformFeePercent()).to.equal(10);
    });

    it("Should fail to set fee above 20%", async function () {
      await expect(
        raceContract.setPlatformFee(25)
      ).to.be.revertedWith("Fee too high");
    });

    it("Should allow owner to update fee collector", async function () {
      await raceContract.setFeeCollector(player1.address);
      expect(await raceContract.feeCollector()).to.equal(player1.address);
    });
  });
});
