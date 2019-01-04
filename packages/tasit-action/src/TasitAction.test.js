import { Contract } from "./TasitAction";
import Account from "tasit-account";
import chai, { expect } from "chai";
chai.use(require("chai-as-promised"));
import sinon from "sinon";
import { waitForEvent, mineBlocks } from "./testHelpers/helpers";

// Note:  Using dist file because babel doesn't compile node_modules files.
// Any changes on src should be following by compilation to avoid unexpected behaviors.
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
      expect(() => {
        new Contract();
      }).to.throw();
    });

    it("constructor without ABI", async () => {
      expect(() => {
        new Contract(contractAddress);
      }).to.throw();
    });

    it("constructor with invalid address", async () => {
      expect(() => {
        new Contract("invalid address");
      }).to.throw();
    });

    it("constructor with invalid address and valid ABI", async () => {
      expect(() => {
        new Contract("invalid address", contractABI);
      }).to.throw();
    });

    it("constructor with valid address and invalid ABI", async () => {
      expect(() => {
        new Contract(contractAddress, "invalid abi");
      }).to.throw();
    });
  });

  it("should call a read-only contract method", async () => {
    const value = await simpleStorage.getValue();
    expect(value).to.exist;
  });

  describe("wallet/account setup tests", async () => {
    it("should throw error when setting no wallet", async () => {
      expect(() => {
        simpleStorage.setWallet();
      }).to.throw();
    });

    it("should throw error when setting invalid wallet", async () => {
      expect(() => {
        simpleStorage.setWallet("invalid wallet");
      }).to.throw();
    });

    it("should throw error when calling write method without account/wallet", async () => {
      expect(() => {
        simpleStorage.setValue("hello world");
      }).to.throw();
    });

    it("should throw error when calling write method after account/wallet removal", async () => {
      simpleStorage.setWallet(wallet);
      simpleStorage.removeWallet();
      expect(() => {
        simpleStorage.setValue("hello world");
      }).to.throw();
    });
  });

  describe("messages/transaction subscriptions tests", async () => {
    let subscription;

    beforeEach("assign a wallet to the contract", () => {
      expect(() => {
        simpleStorage.setWallet(wallet);
      }).to.not.throw();
    });

    afterEach("waiting for message/tx confirmation", async () => {
      if (subscription) {
        await subscription.waitForMessage();
        subscription.removeAllListeners();
      }
    });

    it("should throw when subscribing with invalid trigger", async () => {
      subscription = simpleStorage.setValue("hello world");
      return expect(subscription.on("invalid", () => {})).to.be.rejected;
    });

    it("should throw when subscribing without callback", async () => {
      subscription = simpleStorage.setValue("hello world");
      return expect(subscription.on("confirmation")).to.be.rejected;
    });

    it("should call a write contract method (send tx) - imediate subscription", async () => {
      var rand = Math.floor(Math.random() * Math.floor(1000)).toString();
      subscription = simpleStorage.setValue(rand);
      const fakeFn = sinon.fake();

      const onMessage = async message => {
        const { data } = message;
        const { confirmations } = data;

        if (confirmations >= 7) {
          fakeFn();

          subscription.removeAllListeners();

          const value = await simpleStorage.getValue();
          expect(value).to.equal(rand);

          // UnhandledPromiseRejectionWarning
          //expect(1).to.equal(2);
        }
      };

      await subscription.on("confirmation", onMessage);

      await mineBlocks(simpleStorage.getProvider(), 15);

      expect(fakeFn.called).to.be.true;
    });

    it("should call a write contract method (send tx) - late subscription", async () => {
      var rand = Math.floor(Math.random() * Math.floor(1000)).toString();
      subscription = simpleStorage.setValue(rand);
      const fakeFn = sinon.fake();

      await mineBlocks(simpleStorage.getProvider(), 15);

      const onMessage = async message => {
        const { data } = message;
        const { confirmations } = data;

        if (confirmations >= 7) {
          fakeFn();

          subscription.removeAllListeners();

          const value = await simpleStorage.getValue();
          expect(value).to.equal(rand);
        }
      };

      await subscription.on("confirmation", onMessage);

      await mineBlocks(simpleStorage.getProvider(), 20);

      expect(fakeFn.called).to.be.true;
    });

    it("should remove listener after timeout", async () => {
      subscription = simpleStorage.setValue("hello world");
      const fakeFn = sinon.fake();

      const foreverCallback = async message => {
        fakeFn();
      };

      await subscription.on("confirmation", foreverCallback);

      await mineBlocks(simpleStorage.getProvider(), 20);

      expect(fakeFn.called).to.be.true;

      await new Promise(resolve => setTimeout(resolve, 3000));

      expect(
        subscription.hasListener(),
        "listener should be removed after 5 seconds"
      ).to.be.false;
    });
  });

  describe("contract events subscriptions tests", async () => {
    it("should throw error when subscribing on invalid event", async () => {
      const events = ["ValueChanged", "InvalidEvent"];

      expect(() => {
        subscription = simpleStorage.subscribe(events);
      }).to.throw();
    });

    it("should throw error then listening on invalid event", async () => {
      const events = ["ValueChanged"];
      const subscription = simpleStorage.subscribe(events);

      expect(() => {
        subscription.on("InvalidEvent", () => {});
      }).to.throw();
    });

    it.skip("should listen to an event", async () => {
      const events = ["ValueChanged"];
      const subscription = simpleStorage.subscribe(events);
      const handlerFunction = async message => {};

      subscription.on("ValueChanged", handlerFunction);
    });
  });

  // Send method interface: Contract.send(tx: msg, bool: free) => Subscription
  // On free send how know if identity-contract should be used?
  it.skip("should send a signed message", async () => {});
});
