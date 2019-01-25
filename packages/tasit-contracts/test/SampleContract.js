const chai = require("chai");
const expect = chai.expect;
chai.use(require("chai-as-promised"));

const SampleContract = artifacts.require("./SampleContract.sol");
// Note: It will probably be a point of confusion for new developers
// coming to this project that they'll have to get used to the web3.js
// API for writing truffle tests but then use the ethers.js API and our
// own API also in JavaScript for testing our own code. So the
// ethers.js tests in tasit-act will look different than the truffle tests
// in tasit-contracts testing the same contract.
// For that reason, a possible TODO is removing any truffle tests
// other than those we directly add from 3rd-party projects
contract("SampleContract", function(accounts) {
  let sampleContract;

  beforeEach(async () => {
    sampleContract = await SampleContract.deployed();
  });

  it("should get the value", async function() {
    const value = await sampleContract.getValue();

    expect(value, "Hello World! isn't the initial value.").to.equal(
      "Hello World!"
    );
  });

  it("should remove the value", async function() {
    await sampleContract.removeValue();
    const value = await sampleContract.getValue();

    expect(value, "Value wasn't removed.").to.equal("");
  });

  it("should revert on read", async function() {
    await expect(sampleContract.revertRead()).to.be.rejected;
  });

  it("should revert on write", async function() {
    await expect(sampleContract.revertWrite("some string")).to.be.rejected;
  });
});
