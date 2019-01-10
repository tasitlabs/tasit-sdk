import { Contract } from "./TasitAction";
import Account from "tasit-account";
import chai, { expect } from "chai";
chai.use(require("chai-as-promised"));
import sinon from "sinon";
import {
  waitForEvent,
  mineBlocks,
  createSnapshot,
  revertFromSnapshot,
} from "./testHelpers/helpers";

// Note:  Using dist file because babel doesn't compile node_modules files.
// Any changes on src should be followed by compilation to avoid unexpected behaviors.
import { createFromPrivateKey } from "tasit-account/dist/testHelpers/helpers";

// Note: SimpleStorage.json is originally genarated by `tasit-contracts` and was pasted here manually
// See https://github.com/tasitlabs/TasitSDK/issues/45
import { abi as contractABI } from "./testHelpers/SimpleStorage.json";

// Note: Under the current `tasit-contracts` setup SimpleStorage aways will deployed with this address
// See https://github.com/tasitlabs/TasitSDK/pull/59#discussion_r242258739
const contractAddress = "0x6C4A015797DDDd87866451914eCe1e8b19261931";

describe("TasitAction.Contract", () => {
  let simpleStorage, wallet, testcaseSnaphotId, provider;

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
    expect(simpleStorage.getProvider()).to.exist;

    provider = simpleStorage.getProvider();
    testcaseSnaphotId = await createSnapshot(provider);
  });

  afterEach("revert blockchain snapshot", async () => {
    await revertFromSnapshot(provider, testcaseSnaphotId);
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
    it("should throw error when setting a wallet with no wallet argument", async () => {
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

  describe("actions (tx) subscriptions tests", async () => {
    let subscription;

    beforeEach("assign a wallet to the contract", () => {
      expect(() => {
        simpleStorage.setWallet(wallet);
      }).not.to.throw();
    });

    afterEach("waiting for message/tx confirmation", async () => {
      if (subscription) {
        await subscription.waitForNonceToUpdate();
        subscription.unsubscribe();
      }
    });

    it("should throw when subscribing with invalid event name", async () => {
      subscription = simpleStorage.setValue("hello world");

      expect(() => {
        subscription.on("invalid", () => {});
      }).to.throw();
    });

    it("should throw when subscribing without listener", async () => {
      subscription = simpleStorage.setValue("hello world");

      expect(() => {
        subscription.on("confirmation");
      }).to.throw();
    });

    it("should call a contract action (tx) - immediate subscription", async () => {
      var rand = Math.floor(Math.random() * Math.floor(1000)).toString();
      subscription = simpleStorage.setValue(rand);
      const fakeFn = sinon.fake();

      const listener = async message => {
        const { data } = message;
        const { confirmations } = data;

        if (confirmations >= 7) {
          fakeFn();

          subscription.unsubscribe();

          const value = await simpleStorage.getValue();
          expect(value).to.equal(rand);

          // FIXME: UnhandledPromiseRejectionWarning
          //expect(1).to.equal(2);
        }
      };

      subscription.on("confirmation", listener);

      await mineBlocks(provider, 15);

      expect(fakeFn.called).to.be.true;
    });

    it("should call a contract action (tx) - late subscription", async () => {
      var rand = Math.floor(Math.random() * Math.floor(1000)).toString();
      subscription = simpleStorage.setValue(rand);
      const fakeFn = sinon.fake();

      await mineBlocks(provider, 15);

      const listener = async message => {
        const { data } = message;
        const { confirmations } = data;

        if (confirmations >= 7) {
          fakeFn();

          subscription.off("confirmation");

          const value = await simpleStorage.getValue();
          expect(value).to.equal(rand);
        }
      };

      subscription.on("confirmation", listener);

      await mineBlocks(provider, 20);

      expect(fakeFn.called).to.be.true;
    });

    it("should call error listener after timeout", async () => {
      subscription = simpleStorage.setValue("hello world");
      const confirmationFn = sinon.fake();
      const errorFn = sinon.fake();

      const foreverListener = async message => {
        confirmationFn();
      };

      subscription.on("confirmation", foreverListener);

      const errorListener = message => {
        const { error, eventName } = message;
        expect(error.message).to.equal("Event confirmation reached timeout.");
        errorFn();
      };

      subscription.on("error", errorListener);

      await mineBlocks(provider, 20);

      expect(confirmationFn.called).to.be.true;

      // TODO: Use fake timer
      await new Promise(resolve => setTimeout(resolve, 3000));

      expect(errorFn.called).to.be.true;
    });

    it("subscription should has one listener per event", async () => {
      subscription = simpleStorage.setValue("hello world");

      const listener1 = message => {};
      const listener2 = message => {};

      expect(subscription.eventNames()).to.be.empty;

      subscription.on("confirmation", listener1);

      expect(() => {
        subscription.on("confirmation", listener2);
      }).to.throw();

      expect(subscription.eventNames()).to.deep.equal(["confirmation"]);
    });

    it("should remove an event", async () => {
      subscription = simpleStorage.setValue("hello world");

      const listener1 = message => {};

      expect(subscription.eventNames()).to.be.empty;

      subscription.on("confirmation", listener1);

      expect(subscription.eventNames()).to.deep.equal(["confirmation"]);

      subscription.off("confirmation");

      expect(subscription.eventNames()).to.be.empty;
    });

    it("should emit error event when orphan/uncle block occurs", async () => {
      subscription = simpleStorage.setValue("hello world");

      const confirmationFn = sinon.fake();
      const errorFn = sinon.fake();

      const confirmationListener = message => {
        confirmationFn();
      };

      subscription.on("confirmation", confirmationListener);

      const errorListener = message => {
        const { error, eventName } = message;

        errorFn();
        subscription.unsubscribe();

        // FIXME: Assertion not working
        //expect(1).to.equal(2);
        expect(error.message).to.match(/uncle/);
      };

      subscription.on("error", errorListener);

      const snapshotId = await createSnapshot(provider);

      await mineBlocks(provider, 15);

      expect(confirmationFn.called).to.be.true;

      await revertFromSnapshot(provider, snapshotId);

      await mineBlocks(provider, 20);

      // Broadcast same transaction again (simulate reorg)
      subscription = simpleStorage.setValue("hello world");

      expect(errorFn.called).to.be.true;
    });
  });

  describe("contract events subscription", async () => {
    let subscription;

    beforeEach("assign a wallet to the contract", () => {
      expect(() => {
        simpleStorage.setWallet(wallet);
      }).not.to.throw();
    });

    afterEach("waiting for message/tx confirmation", async () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    });

    it("should throw error when listening on invalid event", async () => {
      subscription = simpleStorage.subscribe();

      expect(() => {
        subscription.on("InvalidEvent", () => {});
      }).to.throw();
    });

    it("subscription should has one listener per event", async () => {
      subscription = simpleStorage.subscribe();

      const listener1 = message => {};
      const listener2 = message => {};

      expect(subscription.eventNames()).to.be.empty;

      subscription.on("ValueChanged", listener1);

      expect(() => {
        subscription.on("ValueChanged", listener2);
      }).to.throw();

      expect(subscription.eventNames()).to.deep.equal(["ValueChanged"]);
    });

    it("should remove an event", async () => {
      subscription = simpleStorage.subscribe();

      const listener1 = message => {};

      expect(subscription.eventNames()).to.be.empty;

      subscription.on("ValueChanged", listener1);

      expect(subscription.eventNames()).to.deep.equal(["ValueChanged"]);

      subscription.off("ValueChanged");

      expect(subscription.eventNames()).to.be.empty;
    });

    // TODO: Rewrite w/ different events (upgrade contract)
    it.skip("should manage many listeners", async () => {
      subscription = simpleStorage.subscribe();

      const listener1 = message => {};
      const listener2 = message => {};
      const listener3 = message => {};

      expect(subscription.eventNames()).to.be.empty;

      subscription.on("ValueChanged", listener1);
      subscription.on("ValueRemoved", listener2);

      expect(subscription.eventNames()).to.deep.equal([
        "ValueChanged",
        "ValueRemoved",
      ]);

      subscription.off("ValueRemoved");

      expect(subscription.eventNames()).to.deep.equal(["ValueChanged"]);

      subscription.on("ValueRemoved", listener3);

      expect(subscription.eventNames()).to.deep.equal([
        "ValueChanged",
        "ValueRemoved",
      ]);

      subscription.unsubscribe();

      expect(subscription.eventNames()).to.be.empty;
    });

    // FIXME: Non-deterministic tests - Quarantine
    // More info: https://github.com/tasitlabs/TasitSDK/pull/95
    it.skip("should listen to an event", async () => {
      subscription = simpleStorage.subscribe();
      const fakeFn = sinon.fake();

      const handlerFunction = async message => {
        const { data } = message;
        const { args } = data;
        fakeFn();
      };

      await subscription.on("ValueChanged", handlerFunction);

      simpleStorage.setValue("hello world");

      await mineBlocks(provider, 15);

      expect(fakeFn.called).to.be.true;
    });
  });

  // Send method interface: Contract.send(tx: msg, bool: free) => Subscription
  // On free send how know if identity-contract should be used?
  it.skip("should send a signed message", async () => {});
});
