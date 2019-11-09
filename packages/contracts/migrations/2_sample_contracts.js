var SampleContract = artifacts.require("./SampleContract.sol");
var MyERC721Full = artifacts.require("./MyERC721Full.sol");
var MyERC20Full = artifacts.require("./MyERC20Full.sol");

module.exports = deployer => {
  deployer.deploy(SampleContract, "Hello World!");
  deployer.deploy(MyERC721Full);
  deployer.deploy(MyERC20Full);
};
