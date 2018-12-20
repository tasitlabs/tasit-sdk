import { expect, assert } from "chai";
import { ethers } from "ethers";

// Note: This file is originally genarated by `tasit-contracts` and was pasted here manually
// See https://github.com/tasitlabs/TasitSDK/issues/45
import { abi as contractABI } from "./helpers/SimpleStorage.json";

// Note: Under the current `tasit-contracts` setup SimpleStorage aways will deployed with this address
// See https://github.com/tasitlabs/TasitSDK/pull/59#discussion_r242258739
const contractAddress = "0x6C4A015797DDDd87866451914eCe1e8b19261931";

let provider, wallet, contract;

describe("ethers.js", () => {
  beforeEach("instantiate provider, wallet and contract objects", async () => {
    provider = new ethers.providers.JsonRpcProvider();
    provider.pollingInterval = 50;

    const privateKey =
      "0x11d943d7649fbdeb146dc57bd9cfc80b086bfab2330c7b25651dbaf382392f60";

    wallet = new ethers.Wallet(privateKey, provider);
    expect(wallet.address).to.have.lengthOf(42);
    expect(wallet.provider).to.be.not.undefined;

    contract = new ethers.Contract(contractAddress, contractABI, wallet);
    expect(contract.address).to.be.equals(contractAddress);
  });

  it("should get contract's value", async () => {
    const value = await contract.getValue();
    expect(value).to.exist;
    expect(value).to.be.a("string");
  });

  it("should set contract's value", async () => {
    var rand = Math.floor(Math.random() * Math.floor(1000)).toString();

    const sentTx = await contract.setValue(rand);
    await provider.waitForTransaction(sentTx.hash);

    const value = await contract.getValue();

    expect(value).to.equal(rand);
  });

  it("should set contract's value using signed tx", async () => {
    var rand = Math.floor(Math.random() * Math.floor(1000)).toString();

    const data = contract.interface.functions.setValue.encode([rand]);

    const rawTx = {
      gasLimit: 64000,
      to: contract.address,
      data: data,
      nonce: await provider.getTransactionCount(wallet.address),
    };

    const signedTx = await wallet.sign(rawTx);
    const sentTx = await provider.sendTransaction(signedTx);

    await provider.waitForTransaction(sentTx.hash);

    const value = await contract.getValue();
    expect(value).to.equal(rand);
  });

  it("should watch contract's ValueChanged event", async () => {
    const oldValue = await contract.getValue();
    const newValue = `I like cats`;

    const sentTx = await contract.setValue(newValue);

    await waitForEvent("ValueChanged", [wallet.address, oldValue, newValue]);
  });
});

const waitForEvent = async (eventName, expected) => {
  return new Promise(function(resolve, reject) {
    contract.on(eventName, function() {
      const args = Array.prototype.slice.call(arguments);
      const event = args.pop();
      event.removeListener();
      expect(
        args,
        `${event.event} event should have expected args`
      ).to.deep.equal(expected);
      resolve();
    });
  });
};
