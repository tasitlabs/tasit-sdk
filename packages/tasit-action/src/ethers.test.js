import { ethers } from "ethers";

// Note: This file is originally genarated by `tasit-contracts` and was pasted here manually
// See https://github.com/tasitlabs/TasitSDK/issues/45
import { abi as contractABI } from "./testHelpers/SimpleStorage.json";

// Note: Under the current `tasit-contracts` setup SimpleStorage aways will deployed with this address
// See https://github.com/tasitlabs/TasitSDK/pull/59#discussion_r242258739
const contractAddress = "0x6C4A015797DDDd87866451914eCe1e8b19261931";

let wallet, contract, testcaseSnaphotId;

describe("ethers.js", () => {
  const provider = new ethers.providers.JsonRpcProvider();
  provider.pollingInterval = 50;

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

    // Note: Without this the test suite is breaking.
    // It is still unclear why
    await mineBlocks(provider, 1);
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
    const eventFakeFn = sinon.fake();

    const oldValue = await contract.getValue();
    const newValue = `I like cats`;

    const listener = event => {
      const {
        author: eventAuthor,
        oldValue: eventOldValue,
        newValue: eventNewValue,
      } = event.args;

      expect([eventAuthor, eventOldValue, eventNewValue]).to.deep.equal([
        wallet.address,
        oldValue,
        newValue,
      ]);

      event.removeListener();

      eventFakeFn();
    };

    const sentTx = await contract.setValue(newValue);

    await waitForEthersEvent(contract, "ValueChanged", listener);

    expect(eventFakeFn.called).to.be.true;
    expect(contract.listenerCount("ValueChanged")).to.equal(0);
    expect(contract.provider._events).to.be.empty;
  });

  it("should remove listener using removeAllListeners function", async () => {
    const eventFakeFn = sinon.fake();

    const listener = () => {
      eventFakeFn();
    };

    const sentTx = await contract.setValue("hello world");

    await waitForEthersEvent(contract, "ValueChanged", listener);

    contract.removeAllListeners("ValueChanged");

    expect(eventFakeFn.called).to.be.true;
    expect(contract.listenerCount("ValueChanged")).to.equal(0);
    expect(contract.provider._events).to.be.empty;
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
