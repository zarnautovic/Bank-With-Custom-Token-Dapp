const { expect } = require("chai");
const BN = require("bn.js");

describe("Bank contract", function () {
  let ZCoin;
  let Bank;
  let zCoin;
  let bank;
  let owner;
  let addr1;

  beforeEach(async () => {
    ZCoin = await ethers.getContractFactory("ZCoin");
    zCoin = await ZCoin.deploy(1000000);

    Bank = await ethers.getContractFactory("Bank");
    bank = await Bank.deploy(zCoin.address);

    [owner, addr1] = await ethers.getSigners();
  });

  describe("Deployment", () => {
    it("Should set the right owner", async () => {
      expect(await zCoin.owner()).to.equal(owner.address);
      expect(await bank.bankOwner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const initialSupply = await zCoin.totalSupply();
      const ownerSupply = await zCoin.balanceOf(owner.address);

      expect(initialSupply).to.equal(ownerSupply);
    });
  });

  describe("Bank contract", () => {
    it("should borrow money to address", async () => {
      await zCoin.connect(owner).transfer(bank.address, 100000);
      const bankBalance = await zCoin.balanceOf(bank.address);
      expect(bankBalance.toString()).to.equal("100000");

      await bank.connect(addr1).borrowMoney(100);
      const addrBalance = await zCoin.balanceOf(addr1.address);
      expect(addrBalance.toString()).to.equal("100");

      const customerDebt = await bank.connect(addr1).getCustomerDebts();
      expect(customerDebt.toString()).to.equal("100");
    });

    it("should deposit money and transfer it to bank contract", async () => {
      await zCoin.connect(owner).transfer(addr1.address, 10000);
      const addrBalance = await zCoin.balanceOf(addr1.address);
      expect(addrBalance.toString()).to.equal("10000");

      zCoin.connect(addr1).approve(bank.address, 1000);
      await bank.connect(addr1).depositMoney(100);

      const addrBalance2 = await zCoin.balanceOf(addr1.address);
      expect(addrBalance2.toString()).to.equal("9900");

      const customerDeposit = await bank.connect(addr1).getCustomerDeposit();
      expect(customerDeposit.toString()).to.equal("100");
    });
  });

  describe("ZCoin contract", () => {
    it("Should mint additional tokens", async () => {
      await zCoin.mint(await zCoin.owner(), 1000000);
      const supply = await zCoin.balanceOf(owner.address);
      expect(supply.toString()).to.equal("1000000000000000001000000");
    });

    it("Should bourn some amount of tokens", async () => {
      await zCoin.burn(500000);
      const supply = await zCoin.balanceOf(owner.address);
      expect(supply.toString()).to.equal("999999999999999999500000");
    });
  });
});
