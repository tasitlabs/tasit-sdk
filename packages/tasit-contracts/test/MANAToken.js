const abi = require("../3rd-parties/decentraland/mana/build/contracts/MANAToken.json")
  .abi;
const localAddresses = require("../3rd-parties/decentraland/addresses").local;
const { MANAToken: address } = localAddresses;

// Note:
// This test suite is using web3.js because contract deployment is made by a 3rd-party repository
// (and most existing 3rd-party contracts tend to use Truffle which uses web3.js)
contract("MANAToken", function(accounts) {
  it("should get the MANAToken name", async function() {
    const MANAToken = new web3.eth.Contract(abi, address);

    const name = await MANAToken.methods.name().call();

    assert.equal(
      name,
      "Decentraland MANA",
      "Decentraland MANA isn't the MANAToken name."
    );
  });
});
