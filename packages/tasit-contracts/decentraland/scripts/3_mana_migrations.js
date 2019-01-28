const MANAToken = artifacts.require("./MANAToken.sol");

module.exports = function(deployer) {
  deployer.deploy(MANAToken);
};
