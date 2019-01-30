// Note:
// This test suite is using web3.js because contract deployment is made by a 3rd-party repository
// (and most existing 3rd-party contracts tend to use Truffle which uses web3.js)
contract("LANDProxy", function(accounts) {
  const abi = require("../decentraland/land/build/contracts/LANDProxy.json")
    .abi;
  const address = "0x773f11ed472aa43e4ebaa963bcfbbea5a10c1bbd";
  const CONTRACT_OWNER = 0xd68649157a061454e2c63c175236b07e98bd9512;

  it("should get the LANDProxy owner", async function() {
    const LANDProxy = new web3.eth.Contract(abi, address);

    const owner = await LANDProxy.methods.owner().call();

    assert.equal(
      owner,
      CONTRACT_OWNER,
      "CONTRACT_OWNER isn't the LANDProxy owner."
    );
  });
});
