const TasitContracts = require("../dist/TasitContracts").TasitContracts;
const { local } = TasitContracts;
const { MANAToken } = local;
const { address, abi } = MANAToken;

// Note:
// This test suite is using web3.js because contract deployment is made by a 3rd-party repository
// (and most existing 3rd-party contracts tend to use Truffle which uses web3.js)
contract("MANAToken", accounts => {
  it("should get the MANAToken name", async () => {
    const manaToken = new web3.eth.Contract(abi, address);

    const name = await manaToken.methods.name().call();

    assert.equal(
      name,
      "Decentraland MANA",
      "Decentraland MANA isn't the MANAToken name."
    );
  });
});
