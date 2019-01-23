// Note:
// Should we use ethers instead web3?
contract("LANDRegistry", function(accounts) {
  const abi = require("../decentraland/land/build/contracts/LANDRegistry.json")
    .abi;
  const address = "0x41b598a2c618b59b74540ac3afffb32f7971b37a";

  it("should get the LANDRegistry owner", async function() {
    const LANDRegistry = new web3.eth.Contract(abi, address);

    const owner = await LANDRegistry.methods.owner().call();

    assert.equal(
      owner,
      0xd68649157a061454e2c63c175236b07e98bd9512,
      "0xd68649157a061454e2c63c175236b07e98bd9512 isn't the LANDRegistry owner."
    );
  });
});
