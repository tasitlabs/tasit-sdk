const GnosisSafe = artifacts.require("./GnosisSafe.sol");
// Note: It will probably be a point of confusion for new developers
// coming to this project that they'll have to get used to the web3.js
// API for writing truffle tests but then use the ethers API and our
// own API also in JavaScript for testing our own code. So the
// ethers tests in tasit-action will look different than the truffle tests
// in tasit-contracts testing the same contract.
// For that reason, a possible TODO is removing any truffle tests
// other than those we directly add from 3rd-party projects
contract("GnosisSafe", accounts => {
  let john;
  let signers;
  let safe;
  before("", async () => {
    john = accounts[9];
    signers = [john];
    safe = await GnosisSafe.deployed();
  });

  it("should get the GnosisSafe owner count", async () => {
    const threshold = await safe.getThreshold();
    const { length: signersCount } = signers;
    assert.equal(threshold, signersCount, "John isn't the contract owner.");
  });

  it("should get the GnosisSafe owner", async () => {
    const owners = await safe.getOwners();
    assert.deepEqual(owners, signers, "John isn't the contract owner.");
  });
});
