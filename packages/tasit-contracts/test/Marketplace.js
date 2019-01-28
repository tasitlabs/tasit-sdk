// Note:
// Should we use ethers instead of web3js?
contract("Marketplace", function(accounts) {
  const abi = require("../decentraland/marketplace-contracts/build/contracts/Marketplace.json")
    .abi;
  const address = "0x289c42facf691946b64b4370361b1303f0a463ef";

  it("contract shouldn't be paused", async function() {
    const Marketplace = new web3.eth.Contract(abi, address);

    const isPaused = await Marketplace.methods.paused().call();

    assert.equal(isPaused, false, "Marketplace is paused.");
  });
});
