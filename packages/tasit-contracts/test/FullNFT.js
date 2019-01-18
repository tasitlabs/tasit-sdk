const FullNFT = artifacts.require("./FullNFT.sol");
// Note: It will probably be a point of confusion for new developers
// coming to this project that they'll have to get used to the web3.js
// API for writing truffle tests but then use the ethers.js API and our
// own API also in JavaScript for testing our own code. So the
// ethers.js tests in tasit-action will look different than the truffle tests
// in tasit-contracts testing the same contract.
// For that reason, a possible TODO is removing any truffle tests
// other than those we directly add from 3rd-party projects
contract("FullNFT", function(accounts) {
  it("should get the NFT name", async function() {
    const fullNFT = await FullNFT.deployed();

    const name = await fullNFT.name();

    assert.equal(name, "Full NFT", "Full NFT isn't the NFT name.");
  });

  it("should get the NFT symbol", async function() {
    const fullNFT = await FullNFT.deployed();

    const symbol = await fullNFT.symbol();

    assert.equal(symbol, "FNFT", "FNFT isn't the NFT symbol.");
  });
});
