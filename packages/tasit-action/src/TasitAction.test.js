import { Contract } from "./TasitAction";
import Account from "tasit-account";
import { expect, assert } from "chai";
import { waitForEvent, mineBlocks } from "./testHelpers/helpers";
import { createFromPrivateKey } from "tasit-account/dist/testHelpers/helpers";

// Note: SimpleStorage.json is originally genarated by `tasit-contracts` and was pasted here manually
// See https://github.com/tasitlabs/TasitSDK/issues/45
import { abi as contractABI } from "./testHelpers/SimpleStorage.json";

// Note: Under the current `tasit-contracts` setup SimpleStorage aways will deployed with this address
// See https://github.com/tasitlabs/TasitSDK/pull/59#discussion_r242258739
const contractAddress = "0x6C4A015797DDDd87866451914eCe1e8b19261931";

describe("Contract", () => {
  let simpleStorage, wallet;

  beforeEach("should connect to an existing contract", async () => {
    // Account creates a wallet, should it create an account object that encapsulates the wallet?
    // TasitAcount.create()
    // > Acount { wallet: ..., metaTxInfos..., etc }
    wallet = createFromPrivateKey(
      "0x11d943d7649fbdeb146dc57bd9cfc80b086bfab2330c7b25651dbaf382392f60"
    );

    simpleStorage = new Contract(contractAddress, contractABI);
    expect(simpleStorage).to.exist;
    expect(simpleStorage.getAddress()).to.equal(contractAddress);
    expect(simpleStorage.getValue).to.exist;
    expect(simpleStorage.setValue).to.exist;
    // Events are not implemented yet
    //expect(simpleStorage.ValueChanged).to.exist;
  });

  describe("should throw error when instantiated with invalid args", () => {
    it("constructor without address and ABI", async () => {
      try {
        new Contract();
        assert(false);
      } catch (e) {
        assert(true);
      }
    });

    it("constructor without ABI", async () => {
      try {
        new Contract(contractAddress);
        assert(false);
      } catch (e) {
        assert(true);
      }
    });

    it("constructor with invalid address", async () => {
      try {
        new Contract("invalid address");
        assert(false);
      } catch (e) {
        assert(true);
      }
    });

    it("constructor with invalid address and valid ABI", async () => {
      try {
        new Contract("invalid address", contractABI);
        assert(false);
      } catch (e) {
        assert(true);
      }
    });

    it("constructor with valid address and invalid ABI", async () => {
      try {
        new Contract(contractAddress, "invalid abi");
        assert(false);
      } catch (e) {
        assert(true);
      }
    });
  });

  it("should call a read-only contract method", async () => {
    const value = await simpleStorage.getValue();
    expect(value).to.exist;
  });

  it("should throw error when setting invalid wallet", async () => {
    try {
      simpleStorage = simpleStorage.setWallet();
      assert(false, "setting no wallet");

      simpleStorage = simpleStorage.setWallet("invalid wallet");
      assert(false, "setting invalid wallet");
    } catch (e) {
      assert(true);
    }
  });

  it("should throw error when calling write method without account/wallet/signer", async () => {
    try {
      simpleStorage.setValue("hello world");
      assert(false, "calling write function without account");
    } catch (e) {
      assert(true);
    }
  });

  it("should throw when subscribing with invalid trigger", async () => {
    simpleStorage = simpleStorage.setWallet(wallet);
    const subscription = simpleStorage.setValue("hello world");

    try {
      await subscription.on("invalid", () => {});
      assert(false, "subscribing with invalid trigger");
    } catch (e) {
      await subscription.waitForMessage();
      assert(true);
    }
  });

  it("should throw when subscribing without callback", async () => {
    simpleStorage = simpleStorage.setWallet(wallet);
    const subscription = simpleStorage.setValue("hello world");

    try {
      await subscription.on("confirmation");
      assert(false, "subscribing without a callback");
    } catch (e) {
      await subscription.waitForMessage();
      assert(true);
    }
  });

  it("should call a write contract method (send tx)", async () => {
    simpleStorage = simpleStorage.setWallet(wallet);

    var rand = Math.floor(Math.random() * Math.floor(1000)).toString();
    const subscription = simpleStorage.setValue(rand);

    const onMessage = async message => {
      // message.data = Contents of the message.
      const { data } = message;
      const { confirmations } = data;

      if (confirmations === 7) {
        subscription.removeAllListeners();

        const value = await simpleStorage.getValue();
        expect(value).to.equal(rand);

        // UnhandledPromiseRejectionWarning
        //expect(1).to.equal(2);
      }
    };

    subscription.on("confirmation", onMessage);

    await mineBlocks(simpleStorage.getProvider(), 8);
  });

  it("should throw error when subscribing on invalid event", async () => {
    const events = ["ValueChanged", "InvalidEvent"];
    try {
      const subscription = simpleStorage.subscribe(events);
      assert(false, "subscription with invalid event");
    } catch (e) {
      assert(true);
    }
  });

  it("should throw error then listening on invalid event", async () => {
    const events = ["ValueChanged"];
    const subscription = simpleStorage.subscribe(events);

    try {
      subscription.on("InvalidEvent", () => {});
      assert(false, "listening with invalid event");
    } catch (e) {
      assert(true);
    }
  });

  it.skip("should listen to an event", async () => {
    const events = ["ValueChanged"];
    const subscription = simpleStorage.subscribe(events);
    const handlerFunction = async message => {};

    subscription.on("ValueChanged", handlerFunction);
  });

  // Send method interface: Contract.send(tx: msg, bool: free) => Subscription
  // On free send how know if identity-contract should be used?
  it.skip("should send a signed message", async () => {});
});
