var GnosisSafe = artifacts.require("./GnosisSafe.sol");

module.exports = (deployer, network, accounts) => {
  const signer = accounts[9];

  // Workaround to write async/await migration scripts
  // See more: https://github.com/trufflesuite/truffle/issues/501#issuecomment-332589663
  deployer.then(async () => {
    const safe = await deployer.deploy(GnosisSafe);
    const owners = [signer];
    const threshold = 1;
    // Contract address for optional delegate call
    const to = "0x0000000000000000000000000000000000000000";
    const data = "0x";
    await safe.setup(owners, threshold, to, data);
    // TODO: Log the address of this newly deployed Safe proxy
  });
};
