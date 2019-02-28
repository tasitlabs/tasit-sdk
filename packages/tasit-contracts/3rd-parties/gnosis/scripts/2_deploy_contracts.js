var ProxyFactory = artifacts.require("./ProxyFactory.sol");
var GnosisSafe = artifacts.require("./GnosisSafe.sol");
var StateChannelModule = artifacts.require("./StateChannelModule.sol");
var DailyLimitModule = artifacts.require("./DailyLimitModule.sol");
var SocialRecoveryModule = artifacts.require("./SocialRecoveryModule.sol");
var WhitelistModule = artifacts.require("./WhitelistModule.sol");
var CreateAndAddModules = artifacts.require("./CreateAndAddModules.sol");
var MultiSend = artifacts.require("./MultiSend.sol");

// accounts[9]
const johnAddress = "0x8226bcef50b3c76a9eb7eba0c09ebbb2362e5db7";

// Note: If you want to change this file, make sure that you are editing
// the original file inside of the `tasit-contracts/3rd-parties/gnosis/scripts`
module.exports = function(deployer) {
  deployer.deploy(ProxyFactory);
  deployer.deploy(GnosisSafe).then(function(safe) {
    safe.setup([johnAddress], 1, 0, 0);
    return safe;
  });
};
