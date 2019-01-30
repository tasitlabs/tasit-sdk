// Note:
// This test suite is using web3js because contract deployment is made by a 3rd party repository
contract("LANDProxy", function(accounts) {
  const abi = require("../decentraland/land/build/contracts/LANDProxy.json")
    .abi;
  const address = "0x773f11ed472aa43e4ebaa963bcfbbea5a10c1bbd";

  it("should get the LANDProxy owner", async function() {
    const LANDProxy = new web3.eth.Contract(abi, address);

    const owner = await LANDProxy.methods.owner().call();

    assert.equal(
      owner,
      0xd68649157a061454e2c63c175236b07e98bd9512,
      "0xd68649157a061454e2c63c175236b07e98bd9512 isn't the LANDProxy owner."
    );
  });
});
