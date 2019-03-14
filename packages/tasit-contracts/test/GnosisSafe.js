const GnosisSafe = artifacts.require("./GnosisSafe.sol");
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
