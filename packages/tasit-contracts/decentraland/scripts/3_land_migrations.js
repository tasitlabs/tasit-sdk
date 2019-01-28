const LANDRegistry = artifacts.require("./LANDRegistry.sol");
const EstateRegistry = artifacts.require("./EstateRegistry.sol");

module.exports = function(deployer) {
  deployer.deploy(EstateRegistry);
  deployer.deploy(LANDRegistry);
};
