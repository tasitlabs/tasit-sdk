var SimpleStorageWithRemoved = artifacts.require(
  "./SimpleStorageWithRemoved.sol"
);

var SimpleNFT = artifacts.require("./SimpleNFT.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorageWithRemoved, "Hello World!");
  deployer.deploy(SimpleNFT);
};
