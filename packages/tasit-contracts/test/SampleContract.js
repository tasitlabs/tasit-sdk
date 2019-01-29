const ethers = require("ethers");
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
  let sampleContract, abi, address;

  beforeEach(async () => {
    sampleContract = await SampleContract.deployed();
    abi = require("../build/contracts/SampleContract.json").abi;
    address = sampleContract.address;
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

  describe("Contract functions overloading - web3js vs ethers.js", () => {
    it("should call overloading functions - web3js", async function() {
      const sampleContractWeb3 = new web3.eth.Contract(abi, address);

      const f1 = await sampleContractWeb3.methods.overloading().call();
      const f2 = await sampleContractWeb3.methods.overloading("a").call();
      const f3 = await sampleContractWeb3.methods.overloading("a", "b").call();

      expect(f1).to.equal("1");
      expect(f2).to.equal("2");
      expect(f3).to.equal("3");
    });

    it("should call overloading functions - ethers", async function() {
      const provider = new ethers.providers.JsonRpcProvider();
      const sampleContractEthers = new ethers.Contract(address, abi, provider);

      const f1 = await sampleContractEthers["overloading()"]();
      const f2 = await sampleContractEthers["overloading(string)"]("a");
      const f3 = await sampleContractEthers["overloading(string,string)"](
        "a",
        "b"
      );

      expect(f1.toNumber()).to.equal(1);
      expect(f2.toNumber()).to.equal(2);
      expect(f3.toNumber()).to.equal(3);
    });

    it.skip("should call overloading functions - ethers", async function() {
      const provider = new ethers.providers.JsonRpcProvider();
      const sampleContractEthers = new ethers.Contract(address, abi, provider);

      // Error: incorrect number of arguments
      const f1 = await sampleContractEthers.overloading();
      const f2 = await sampleContractEthers.overloading("a");
      const f3 = await sampleContractEthers.overloading("a", "b");

      expect(f1.toNumber()).to.equal(1);
      expect(f2.toNumber()).to.equal(2);
      expect(f3.toNumber()).to.equal(3);
    });
  });
});
