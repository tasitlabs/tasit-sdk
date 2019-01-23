// Note:
// Should we use ethers instead of web3js?
contract("Marketplace", function(accounts) {
  const abi = require("../decentraland/marketplace-contracts/build/contracts/Marketplace.json")
    .abi;
  const address = "0xa84f6990607546ceb41cadbd37d2a886ce96f8e8";

  it("contract shouldn't be paused", async function() {
    const Marketplace = new web3.eth.Contract(abi, address);

    const isPaused = await Marketplace.methods.paused().call();

    assert.equal(isPaused, false, "Marketplace is paused.");
  });
});
