const abi = require("../decentraland/land/build/contracts/EstateRegistry.json")
  .abi;
const localAddresses = require("../decentraland/addresses").local;
const { LANDRegistry: landAddress, EstateRegistry: address } = localAddresses;

// Note:
// This test suite is using web3.js because contract deployment is made by a 3rd-party repository
// (and most existing 3rd-party contracts tend to use Truffle which uses web3.js)
contract("EstateRegistry", function(accounts) {
  const [owner] = accounts;

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
