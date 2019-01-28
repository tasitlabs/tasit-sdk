// Note:
// Should we use ethers instead of web3js?
contract("EstateRegistry", function(accounts) {
  const [owner] = accounts;

  const abi = require("../decentraland/land/build/contracts/EstateRegistry.json")
    .abi;
  const address = "0x41b598a2c618b59b74540ac3afffb32f7971b37a";

  const landAddress = "0x6191bc768c2339da9eab9e589fc8bf0b3ab80975";

  const gasParams = { gas: 7e6, gasPrice: 1e9 };

  it("should initialize and get the EstateRegistry name", async function() {
    const EstateRegistry = new web3.eth.Contract(abi, address);

    await EstateRegistry.methods
      .initialize("Estate", "EST", landAddress)
      .send({ from: owner, ...gasParams });

    let name = await EstateRegistry.methods.name().call();

    assert.equal(
      name,
      "Estate",
      "Estate isn't the EstateRegistry totalSupply."
    );
  });
});
