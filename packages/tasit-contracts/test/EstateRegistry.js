// Note:
// Should we use ethers instead of web3js?
contract("EstateRegistry", function(accounts) {
  const [owner] = accounts;

  const abi = require("../decentraland/land/build/contracts/EstateRegistry.json")
    .abi;
  const address = "0x41b598a2c618b59b74540ac3afffb32f7971b37a";

  it("should get the LANDRegistry owner", async function() {
    const EstateRegistry = new web3.eth.Contract(abi, address);

    let totalSupply = await EstateRegistry.methods.totalSupply().call();

    assert.equal(totalSupply, 0, "0 isn't the EstateRegistry totalSupply.");
  });
});
