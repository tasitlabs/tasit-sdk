var SimpleStorage = artifacts.require("./SimpleStorage.sol");

contract('SimpleStorage', function(accounts) {

  it("should get the value", function() {
    return SimpleStorage.deployed().then(function(instance) {
      return instance.getValue.call();
  }).then(function(value) {
      assert.equal(value.valueOf(), "Hello World!", "Hello World! isn't the initial value.");
    });
  });

});
