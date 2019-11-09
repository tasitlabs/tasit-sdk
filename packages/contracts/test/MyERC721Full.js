const MyERC721Full = artifacts.require("./MyERC721Full.sol");
// Note: It will probably be a point of confusion for new developers
// coming to this project that they'll have to get used to the web3.js
// API for writing truffle tests but then use the ethers.js API and our
// own API also in JavaScript for testing our own code. So the
// ethers.js tests in tasit-action will look different than the truffle tests
// in tasit-contracts testing the same contract.
// For that reason, a possible TODO is removing any truffle tests
// other than those we directly add from 3rd-party projects
contract("MyERC721Full", accounts => {
  let erc721;
  before("", async () => {
    erc721 = await MyERC721Full.deployed();
  });

  it("should get the contract name", async () => {
    const name = await erc721.name();
    assert.equal(name, "ERC721Full", "ERC721Full isn't the contract name.");
  });

  it("should get the contract symbol", async () => {
    const symbol = await erc721.symbol();
    assert.equal(symbol, "ERC721", "ERC721 isn't the contract symbol.");
  });
});
