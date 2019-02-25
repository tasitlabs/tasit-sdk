const DetailedERC20 = artifacts.require("./DetailedERC20.sol");
// Note: It will probably be a point of confusion for new developers
// coming to this project that they'll have to get used to the web3.js
// API for writing truffle tests but then use the ethers.js API and our
// own API also in JavaScript for testing our own code. So the
// ethers.js tests in tasit-action will look different than the truffle tests
// in tasit-contracts testing the same contract.
// For that reason, a possible TODO is removing any truffle tests
// other than those we directly add from 3rd-party projects
contract("DetailedERC20", function(accounts) {
  it("should get the ERC20 name", async function() {
    const erc20 = await DetailedERC20.deployed();

    const name = await erc20.name();

    assert.equal(
      name,
      "Detailed ERC20 Token",
      "Detailed ERC20 Token isn't the ERC20 name."
    );
  });

  it("should get the ERC20 symbol", async function() {
    const erc20 = await DetailedERC20.deployed();

    const symbol = await erc20.symbol();

    assert.equal(symbol, "DERC20", "DERC20 isn't the ERC20 symbol.");
  });
});
