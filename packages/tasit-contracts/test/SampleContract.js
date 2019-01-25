const SimpleStorage = artifacts.require("./SimpleStorageWithRemoved.sol");
// Note: It will probably be a point of confusion for new developers
// coming to this project that they'll have to get used to the web3.js
// API for writing truffle tests but then use the ethers.js API and our
// own API also in JavaScript for testing our own code. So the
// ethers.js tests in tasit-act will look different than the truffle tests
// in tasit-contracts testing the same contract.
// For that reason, a possible TODO is removing any truffle tests
// other than those we directly add from 3rd-party projects
contract("SimpleStorage", function(accounts) {
  it("should get the value", async function() {
    const instance = await SimpleStorage.deployed();

    const value = await instance.getValue();

    assert.equal(
      value,
      "Hello World!",
      "Hello World! isn't the initial value."
    );
  });

  it("should remove the value", async function() {
    const instance = await SimpleStorage.deployed();

    await instance.removeValue();
    const value = await instance.getValue();

    assert.equal(value, "", "Value wasn't removed.");
  });
});
