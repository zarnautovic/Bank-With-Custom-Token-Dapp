const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();
  const zCoinContractFactory = await hre.ethers.getContractFactory("ZCoin");
  const zCoinContract = await zCoinContractFactory.deploy(1000000);
  await zCoinContract.deployed();

  const bankContractFactory = await hre.ethers.getContractFactory("Bank");
  const bankContract = await bankContractFactory.deploy(zCoinContract.address);
  await bankContract.deployed();

  console.log("ZCoin Contract deployed to:", zCoinContract.address);
  console.log("ZCoin Contract owner address:", owner.address);

  console.log("Bank Contract deployed to:", bankContract.address);
  console.log("Bank Contract owner address:", owner.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
