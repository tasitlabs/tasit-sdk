import { ethers } from "ethers";

import TasitContracts from "@tasit/contracts";

import ProviderFactory from "./ProviderFactory";
import { accounts } from "@tasit/test-helpers";
ethers.errors.setLogLevel("error");
const { local: localContracts } = TasitContracts;
const { SampleContract } = localContracts;
const {
  abi: sampleContractABI,
  address: SAMPLE_CONTRACT_ADDRESS,
} = SampleContract;

const provider = ProviderFactory.getProvider();

let wallet;
let sampleContract;

describe.only("ethers", () => {
  // instantiate provider, wallet and contract objects
  beforeEach(async () => {
    await provider.ready;
    [wallet] = accounts;
    wallet = wallet.connect(provider);
    expect(wallet.address).toHaveLength(42);
    expect(wallet.provider).toBeDefined();

    // console.log({ wallet })

    // TODO: Determine why we're getting "contract not deployed" error
    // with this provider
    // Maybe something with buidler config for root vs. @tasit/contracts?
    // Or a subtle difference in the provider?
    sampleContract = new ethers.Contract(
      SAMPLE_CONTRACT_ADDRESS,
      sampleContractABI,
      provider
    );

    expect(sampleContract.address).toBe(SAMPLE_CONTRACT_ADDRESS);
  });

  it("should instantiate contract object using human-readable ABI", async () => {
    const humanReadableABI = [
      "event ValueChanged(address indexed author, string oldValue, string newValue)",
      "constructor(string memory) public",
      "function getValue() public view returns (string memory)",
      "function setValue(string memory) public",
    ];

    sampleContract = undefined;
    sampleContract = new ethers.Contract(
      SAMPLE_CONTRACT_ADDRESS,
      humanReadableABI,
      provider
    );
    expect(sampleContract.interface.functions.getValue).toBeDefined();
    expect(sampleContract.interface.functions.setValue).toBeDefined();
    expect(sampleContract.interface.events.ValueChanged).toBeDefined();
  });

  it("should get contract's value", async () => {
    const value = await sampleContract.getValue();
    expect(value).toBeDefined();
    expect(value).toBeInstanceOf("string");
  });

  it("should set contract's value", async () => {
    sampleContract = sampleContract.connect(wallet);
    const rand = Math.floor(Math.random() * Math.floor(1000)).toString();

    const sentTx = await sampleContract.setValue(rand);
    await provider.waitForTransaction(sentTx.hash);

    const value = await sampleContract.getValue();

    expect(value).toBe(rand);
  });

  it("should watch contract's ValueChanged event", done => {
    (async () => {
      const oldValue = await sampleContract.getValue();
      const newValue = `I like cats`;

      const timeout = setTimeout(() => {
        done(new Error("timeout"));
      }, 2000);

      const listener = (...args) => {
        const event = args.pop();
        const {
          author: eventAuthor,
          oldValue: eventOldValue,
          newValue: eventNewValue,
        } = event.args;

        expect([eventAuthor, eventOldValue, eventNewValue]).toEqual([
          wallet.address,
          oldValue,
          newValue,
        ]);

        event.removeListener();
        expect(sampleContract.listenerCount("ValueChanged")).toBe(0);
        expect(sampleContract.provider._events).toHaveLength(0);
        clearTimeout(timeout);
        done();
      };

      sampleContract.on("ValueChanged", listener);

      await sampleContract.setValue(newValue);
    })();
  });

  it("should remove listener using removeAllListeners function", done => {
    (async () => {
      const timeout = setTimeout(() => {
        done(new Error("timeout"));
      }, 2000);

      const listener = () => {
        sampleContract.removeAllListeners("ValueChanged");
        expect(sampleContract.listenerCount("ValueChanged")).toBe(0);
        expect(sampleContract.provider._events).toHaveLength(0);
        clearTimeout(timeout);
        done();
      };

      sampleContract.on("ValueChanged", listener);

      await sampleContract.setValue("hello world");
    })();
  });

  describe("message signing", () => {
    const rand = Math.floor(Math.random() * Math.floor(1000)).toString();
    let rawTx;
    let signedTx;

    beforeEach(async () => {
      const data = sampleContract.interface.functions.setValue.encode([rand]);

      rawTx = {
        gasLimit: 64000,
        to: sampleContract.address,
        data: data,
        nonce: await provider.getTransactionCount(wallet.address),
      };
    });

    it("should sign set contract's value tx", async () => {
      signedTx = await wallet.sign(rawTx);
      expect(signedTx).toBeDefined();
    });

    it("should set contract's value using signed tx", async () => {
      const sentTx = await provider.sendTransaction(signedTx);

      await provider.waitForTransaction(sentTx.hash);

      const value = await sampleContract.getValue();
      expect(value).toBe(rand);
    });
  });

  // Note: ethers doesn't support function overloading and it only exposes
  // one of the functions with the same name (first of ABI), the other functions should be called as below.
  // Note that this is different behavior from web3.js
  // See more: packages/contracts/test/SampleContract
  // and https://github.com/ethers-io/ethers.js/issues/407
  it("should call overloading functions - ethers", async () => {
    const f1 = await sampleContract["overloading()"]();
    const f2 = await sampleContract["overloading(string)"]("a");
    const f3 = await sampleContract["overloading(string,string)"]("a", "b");

    expect(f1.toNumber()).toBe(1);
    expect(f2.toNumber()).toBe(2);
    expect(f3.toNumber()).toBe(3);
  });
});
