const LANDRegistry = artifacts.require("./LANDRegistry.sol");
// Note: It will probably be a point of confusion for new developers
// coming to this project that they'll have to get used to the web3.js
// API for writing truffle tests but then use the ethers API and our
// own API also in JavaScript for testing our own code. So the
// ethers tests in tasit-action will look different than the truffle tests
// in tasit-contracts testing the same contract.
// For that reason, a possible TODO is removing any truffle tests
// other than those we directly add from 3rd-party projects
contract("LANDRegistry", async accounts => {
  const [CONTRACT_OWNER] = accounts;
  let landRegistry;
  before("", async () => {
    landRegistry = await LANDRegistry.deployed();
  });

  it("should get the LANDRegistry owner", async () => {
    const owner = await landRegistry.owner();
    assert.equal(
      owner,
      CONTRACT_OWNER,
      "CONTRACT_OWNER isn't the LANDProxy owner."
    );
  });
});
