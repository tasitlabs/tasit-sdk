var SampleContract = artifacts.require("./SampleContract.sol");
var ERC721Full = artifacts.require("./ERC721Full.sol");
var ERC20Detailed = artifacts.require("./ERC20Detailed.sol");

module.exports = function(deployer) {
  deployer.deploy(SampleContract, "Hello World!");
  deployer.deploy(ERC721Full);
  deployer.deploy(ERC20Detailed);
};
