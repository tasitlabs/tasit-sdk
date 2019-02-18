const LANDRegistry = artifacts.require("./LANDRegistry.sol");
const EstateRegistry = artifacts.require("./EstateRegistry.sol");
const LANDProxy = artifacts.require("./LANDProxy.sol");

module.exports = function(deployer) {
  deployer.deploy(EstateRegistry);
  deployer.deploy(LANDRegistry);
  deployer.deploy(LANDProxy);
};
