"use strict";

var _chai = require("chai");

var _ethers = require("ethers");

var _SimpleStorage = require("./helpers/SimpleStorage.json");

// Note: This file is originally genarated by `tasit-contracts` and was pasted here manually
// See https://github.com/tasitlabs/TasitSDK/issues/45
// Note: Under the current `tasit-contracts` setup SimpleStorage aways will deployed with this address
// See https://github.com/tasitlabs/TasitSDK/pull/59#discussion_r242258739
const contractAddress = "0x6C4A015797DDDd87866451914eCe1e8b19261931";
let provider, wallet, contract;
describe("ethers.js", () => {
  beforeEach("instantiate provider, wallet and contract objects", async function () {
    provider = new _ethers.ethers.providers.JsonRpcProvider();
    provider.pollingInterval = 50;
    const privateKey = "0x11d943d7649fbdeb146dc57bd9cfc80b086bfab2330c7b25651dbaf382392f60";
    wallet = new _ethers.ethers.Wallet(privateKey, provider);
    (0, _chai.expect)(wallet.address).to.have.lengthOf(42);
    (0, _chai.expect)(wallet.provider).to.be.not.undefined;
    contract = new _ethers.ethers.Contract(contractAddress, _SimpleStorage.abi, wallet);
    (0, _chai.expect)(contract.address).to.be.equals(contractAddress);
  });
  it("should get/set contract's value", async () => {
    const currentValue = await contract.getValue();
    const message = `I like dogs`;
    (0, _chai.expect)(currentValue).to.be.not.equals(message);
    const updateValueTx = await contract.setValue(message);
    await provider.waitForTransaction(updateValueTx.hash);
    const newValue = await contract.getValue();
    (0, _chai.expect)(newValue).to.equal(message);
  });
  it("should watch contract's ValueChanged event", async () => {
    const oldValue = await contract.getValue();
    const newValue = `I like cats`;
    const tx = await contract.setValue(newValue);
    await waitForEvent("ValueChanged", [wallet.address, oldValue, newValue]);
    await provider.waitForTransaction(tx.hash);
  });
});

const waitForEvent = async (eventName, expected) => {
  return new Promise(function (resolve, reject) {
    contract.on(eventName, function () {
      const args = Array.prototype.slice.call(arguments);
      const event = args.pop();
      event.removeListener();
      (0, _chai.expect)(args, `${event.event} event should have expected args`).to.deep.equal(expected);
      resolve();
    });
  });
};