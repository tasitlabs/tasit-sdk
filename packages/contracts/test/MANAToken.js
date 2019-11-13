const MANAToken = artifacts.require("./MANAToken.sol");
// Note: It will probably be a point of confusion for new developers
// coming to this project that they'll have to get used to the web3.js
// API for writing truffle tests but then use the ethers.js API and our
// own API also in JavaScript for testing our own code. So the
// ethers.js tests in tasit-action will look different than the truffle tests
// in tasit-contracts testing the same contract.
// For that reason, a possible TODO is removing any truffle tests
// other than those we directly add from 3rd-party projects
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
