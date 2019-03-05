const TasitContracts = require("../dist/TasitContracts").TasitContracts;
const { local } = TasitContracts;
const { Marketplace } = local;
const { address, abi } = Marketplace;

// Note:
// This test suite is using web3js because contract deployment is made by a 3rd party repository
contract("Marketplace", accounts => {
  it("contract shouldn't be paused", async () => {
    const marketplace = new web3.eth.Contract(abi, address);

    const isPaused = await marketplace.methods.paused().call();

    assert.equal(isPaused, false, "Marketplace is paused.");
  });
});
