const Marketplace = artifacts.require("./Marketplace.sol");
// Note: It will probably be a point of confusion for new developers
// coming to this project that they'll have to get used to the web3.js
// API for writing truffle tests but then use the ethers API and our
// own API also in JavaScript for testing our own code. So the
// ethers tests in tasit-action will look different than the truffle tests
// in tasit-contracts testing the same contract.
// For that reason, a possible TODO is removing any truffle tests
// other than those we directly add from 3rd-party projects
contract("Marketplace", accounts => {
  let marketplace;
  before("", async () => {
    marketplace = await Marketplace.deployed();
  });

  it("should get the MANAToken name", async () => {
    const isPaused = await marketplace.paused();
    assert.equal(isPaused, false, "Marketplace is paused.");
  });
});
