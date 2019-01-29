// Note:
// This test suite is using web3js directly because the contract deployment
// is made by a 3rd part epository
contract("Marketplace", function(accounts) {
  const abi = require("../decentraland/marketplace-contracts/build/contracts/Marketplace.json")
    .abi;
  const address = "0x07c0e972064e5c05f7b3596d81de1afd35457eae";

  it("contract shouldn't be paused", async function() {
    const Marketplace = new web3.eth.Contract(abi, address);

    const isPaused = await Marketplace.methods.paused().call();

    assert.equal(isPaused, false, "Marketplace is paused.");
  });
});
