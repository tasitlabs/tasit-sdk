const LANDProxy = artifacts.require("./LANDProxy.sol");
// Note: It will probably be a point of confusion for new developers
// coming to this project that they'll have to get used to the web3.js
// API for writing truffle tests but then use the ethers.js API and our
// own API also in JavaScript for testing our own code. So the
// ethers.js tests in tasit-action will look different than the truffle tests
// in tasit-contracts testing the same contract.
// For that reason, a possible TODO is removing any truffle tests
// other than those we directly add from 3rd-party projects
contract("LANDProxy", async accounts => {
  const [CONTRACT_OWNER] = accounts;

  let landProxy;
  before("", async () => {
    landProxy = await LANDProxy.deployed();
  });

  it("should get the LANDProxy owner", async () => {
    const owner = await landProxy.owner();
    assert.equal(
      owner,
      CONTRACT_OWNER,
      "CONTRACT_OWNER isn't the LANDProxy owner."
    );
  });
});
