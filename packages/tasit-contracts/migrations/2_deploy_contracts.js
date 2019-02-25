var SampleContract = artifacts.require("./SampleContract.sol");
var FullNFT = artifacts.require("./FullNFT.sol");
var DetailedERC20 = artifacts.require("./DetailedERC20.sol");

module.exports = function(deployer) {
  deployer.deploy(SampleContract, "Hello World!");
  deployer.deploy(FullNFT);
  deployer.deploy(DetailedERC20);
};
