const abi = require("../decentraland/marketplace-contracts/build/contracts/Marketplace.json")
  .abi;
const localAddresses = require("../decentraland/addresses").local;
const { Marketplace: address } = localAddresses;

// Note:
// This test suite is using web3js because contract deployment is made by a 3rd party repository
contract("Marketplace", function(accounts) {
  it("contract shouldn't be paused", async function() {
    const Marketplace = new web3.eth.Contract(abi, address);

    const isPaused = await Marketplace.methods.paused().call();

    assert.equal(isPaused, false, "Marketplace is paused.");
  });
});
