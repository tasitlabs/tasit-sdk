const LANDRegistry = artifacts.require("./LANDRegistry.sol");

module.exports = function(deployer) {
  deployer.deploy(LANDRegistry);
};
