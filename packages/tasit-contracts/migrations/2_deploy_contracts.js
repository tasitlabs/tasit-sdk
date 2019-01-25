var SampleContract = artifacts.require("./SampleContract.sol");
var FullNFT = artifacts.require("./FullNFT.sol");

module.exports = function(deployer) {
  deployer.deploy(SampleContract, "Hello World!");
  deployer.deploy(FullNFT);
};
