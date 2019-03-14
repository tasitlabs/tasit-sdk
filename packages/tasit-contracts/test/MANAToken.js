const MANAToken = artifacts.require("./MANAToken.sol");

// Note:
// This test suite is using web3.js because contract deployment is made by a 3rd-party repository
// (and most existing 3rd-party contracts tend to use Truffle which uses web3.js)
contract("MANAToken", accounts => {
  let manaToken;
  before("", async () => {
    manaToken = await MANAToken.deployed();
  });

  it("should get the MANAToken name", async () => {
    const name = await manaToken.name();

    assert.equal(
      name,
      "Decentraland MANA",
      "Decentraland MANA isn't the MANAToken name."
    );
  });
});
