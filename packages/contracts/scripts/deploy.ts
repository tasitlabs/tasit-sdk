// import { ethers } from "@nomiclabs/buidler";
const { ethers } = require("@nomiclabs/buidler");

async function main() {
  // Buidler always runs the compile task when running scripts through it. 
  // If this runs in a standalone fashion you may want to call compile manually 
  // to make sure everything is compiled
  // await bre.run('compile');

  const SampleContract = await ethers.getContractFactory("SampleContract");
  const sampleContract = await SampleContract.deploy("first value");

  await sampleContract.deployed();

  console.log("SampleContract deployed to:", sampleContract.address);

  const MyERC721 = await ethers.getContractFactory("MyERC721");
  const myERC721 = await MyERC721.deploy();

  await myERC721.deployed();

  console.log("MyERC721 deployed to:", myERC721.address);

  const MyERC20 = await ethers.getContractFactory("MyERC20");
  const myERC20 = await MyERC20.deploy();

  await myERC20.deployed();

  console.log("MyERC20 deployed to:", myERC20.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
