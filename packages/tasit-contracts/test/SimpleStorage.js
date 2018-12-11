const SimpleStorage = artifacts.require("./SimpleStorage.sol");

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
});
