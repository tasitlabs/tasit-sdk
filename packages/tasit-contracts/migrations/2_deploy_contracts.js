var SimpleStorageWithRemoved = artifacts.require(
  "./SimpleStorageWithRemoved.sol"
);

module.exports = function(deployer) {
  deployer.deploy(SimpleStorageWithRemoved, "Hello World!");
};
