import { expect, assert } from "chai";
import { ethers } from "ethers";
import {
  waitForEvent,
  createSnapshot,
  revertFromSnapshot,
  mineBlocks,
} from "./testHelpers/helpers.js";

// Note: This file is originally genarated by `tasit-contracts` and was pasted here manually
// See https://github.com/tasitlabs/TasitSDK/issues/45
import { abi as contractABI } from "./testHelpers/SimpleStorage.json";

// Note: Under the current `tasit-contracts` setup SimpleStorage aways will deployed with this address
// See https://github.com/tasitlabs/TasitSDK/pull/59#discussion_r242258739
const contractAddress = "0x6C4A015797DDDd87866451914eCe1e8b19261931";

let wallet, contract, testcaseSnaphotId;

describe("ethers.js", () => {
  const provider = new ethers.providers.JsonRpcProvider();
  provider.pollingInterval = 100;

  beforeEach("instantiate provider, wallet and contract objects", async () => {
    const privateKey =
      "0x11d943d7649fbdeb146dc57bd9cfc80b086bfab2330c7b25651dbaf382392f60";

    wallet = new ethers.Wallet(privateKey, provider);
    expect(wallet.address).to.have.lengthOf(42);
    expect(wallet.provider).to.be.not.undefined;

    contract = new ethers.Contract(contractAddress, contractABI, wallet);
    expect(contract.address).to.be.equals(contractAddress);

    testcaseSnaphotId = await createSnapshot(provider);
  });

  afterEach("revert blockchain snapshot", async () => {
    await revertFromSnapshot(provider, testcaseSnaphotId);
  });

  it("should instatiate contract object using human-readable ABI", async () => {
    const humanReadableABI = [
      "event ValueChanged(address indexed author, string oldValue, string newValue)",
      "constructor(string memory) public",
      "function getValue() public view returns (string memory)",
      "function setValue(string memory) public",
    ];

    contract = undefined;
    contract = new ethers.Contract(contractAddress, humanReadableABI, wallet);
    expect(contract.interface.functions.getValue).to.exist;
    expect(contract.interface.functions.setValue).to.exist;
    expect(contract.interface.events.ValueChanged).to.exist;
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

  it("should watch contract's ValueChanged event", async () => {
    const oldValue = await contract.getValue();
    const newValue = `I like cats`;

    const sentTx = await contract.setValue(newValue);

    await waitForEvent(contract, "ValueChanged", [
      wallet.address,
      oldValue,
      newValue,
    ]);
  });

  describe("message signing", () => {
    const rand = Math.floor(Math.random() * Math.floor(1000)).toString();
    let rawTx, signedTx;

    beforeEach("", async () => {
      const data = contract.interface.functions.setValue.encode([rand]);

      rawTx = {
        gasLimit: 64000,
        to: contract.address,
        data: data,
        nonce: await provider.getTransactionCount(wallet.address),
      };
    });

    it("should sign set contract's value tx", async () => {
      signedTx = await wallet.sign(rawTx);
      expect(signedTx).to.exist;
    });

    it("should set contract's value using signed tx", async () => {
      const sentTx = await provider.sendTransaction(signedTx);

      await provider.waitForTransaction(sentTx.hash);

      const value = await contract.getValue();
      expect(value).to.equal(rand);
    });
  });
});
