var SimpleStorageWithRemoved = artifacts.require(
  "./SimpleStorageWithRemoved.sol"
);

var FullNFT = artifacts.require("./FullNFT.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorageWithRemoved, "Hello World!");
  deployer.deploy(FullNFT);
};
