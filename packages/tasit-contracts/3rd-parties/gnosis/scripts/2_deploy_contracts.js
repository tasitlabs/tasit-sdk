var ProxyFactory = artifacts.require("./ProxyFactory.sol");
var GnosisSafe = artifacts.require("./GnosisSafe.sol");
var StateChannelModule = artifacts.require("./StateChannelModule.sol");
var DailyLimitModule = artifacts.require("./DailyLimitModule.sol");
var SocialRecoveryModule = artifacts.require("./SocialRecoveryModule.sol");
var WhitelistModule = artifacts.require("./WhitelistModule.sol");
var CreateAndAddModules = artifacts.require("./CreateAndAddModules.sol");
var MultiSend = artifacts.require("./MultiSend.sol");

const anaAddress = "0xd68649157A061454e2c63c175236b07e98Bd9512";
const bobAddress = "0x8a5D5298dcceA526754064b8094e663162E1dBEa";

module.exports = function(deployer) {
  deployer.deploy(ProxyFactory);
  deployer.deploy(GnosisSafe).then(function(safe) {
    safe.setup([anaAddress], 1, 0, 0);
    return safe;
  });
  deployer.deploy(StateChannelModule).then(function(module) {
    module.setup();
    return module;
  });
  deployer.deploy(DailyLimitModule).then(function(module) {
    module.setup([], []);
    return module;
  });
  deployer.deploy(SocialRecoveryModule).then(function(module) {
    module.setup([anaAddress, bobAddress], 2);
    return module;
  });
  deployer.deploy(WhitelistModule).then(function(module) {
    module.setup([]);
    return module;
  });
  deployer.deploy(CreateAndAddModules);
  deployer.deploy(MultiSend);
};
