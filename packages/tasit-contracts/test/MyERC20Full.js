const ERC20Detailed = artifacts.require("./ERC20Detailed.sol");
// Note: It will probably be a point of confusion for new developers
// coming to this project that they'll have to get used to the web3.js
// API for writing truffle tests but then use the ethers.js API and our
// own API also in JavaScript for testing our own code. So the
// ethers.js tests in tasit-action will look different than the truffle tests
// in tasit-contracts testing the same contract.
// For that reason, a possible TODO is removing any truffle tests
// other than those we directly add from 3rd-party projects
contract("ERC20Detailed", async accounts => {
  const erc20 = await ERC20Detailed.deployed();

  it("should get the contract name", async () => {
    const name = await erc20.name();
    assert.equal(
      name,
      "ERC20Detailed Token",
      "ERC20Detailed Token isn't the contract name."
    );
  });

  it("should get the ERC20 symbol", async () => {
    const symbol = await erc20.symbol();
    assert.equal(symbol, "ERC20", "ERC20 isn't the contract symbol.");
  });
});
