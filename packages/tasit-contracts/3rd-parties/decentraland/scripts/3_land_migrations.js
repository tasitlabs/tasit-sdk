const LANDRegistry = artifacts.require("./LANDRegistry.sol");
const EstateRegistry = artifacts.require("./EstateRegistry.sol");
const LANDProxy = artifacts.require("./LANDProxy.sol");

// Note: If you want to change this file, make sure that you are editing
// the original file inside of the `tasit-contracts/3rd-parties/decentraland/scripts`
module.exports = function(deployer) {
  deployer.deploy(EstateRegistry);
  deployer.deploy(LANDRegistry);
  deployer.deploy(LANDProxy);
};
