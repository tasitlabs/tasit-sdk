var ProxyFactory = artifacts.require("./ProxyFactory.sol");
var GnosisSafe = artifacts.require("./GnosisSafe.sol");

// accounts[9]
const johnAddress = "0x8226bcef50b3c76a9eb7eba0c09ebbb2362e5db7";

module.exports = function(deployer) {
  // Workaround to write async/await migration scripts
  // See more: https://github.com/trufflesuite/truffle/issues/501#issuecomment-332589663
  deployer.then(async () => {
    const proxyFactory = await deployer.deploy(ProxyFactory);
    const safe = await deployer.deploy(GnosisSafe);
    const owners = [johnAddress];
    const threshold = 1;
    // Contract address for optional delegate call
    const to = "0x0000000000000000000000000000000000000000";
    const data = "0x";
    await safe.setup(owners, threshold, to, data);
  });
};
