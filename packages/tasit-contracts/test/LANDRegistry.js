// Note:
// Should we use ethers instead of web3js?
contract("LANDRegistry", function(accounts) {
  const abi = require("../decentraland/land/build/contracts/LANDRegistry.json")
    .abi;
  const address = "0x6191bc768c2339da9eab9e589fc8bf0b3ab80975";

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
