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
  let simpleStorage,
    wallet,
    testcaseSnaphotId,
    provider,
    txSubscription,
    contractSubscription;

  beforeEach("should connect to an existing contract", async () => {
    if (contractSubscription) {
      expect(contractSubscription.subscribedEventNames()).to.be.empty;
    }

    if (txSubscription) {
      expect(txSubscription.subscribedEventNames()).to.be.empty;
    }

    simpleStorage = wallet = testcaseSnaphotId = provider = txSubscription = contractSubscription = undefined;
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
    if (contractSubscription) {
      contractSubscription.unsubscribe();

      expect(
        contractSubscription.getEmitter()._events,
        "ethers.js should not be listening to any events."
      ).to.be.empty;
    }

    if (txSubscription) {
      await txSubscription.waitForNonceToUpdate();
      txSubscription.unsubscribe();

      expect(
        txSubscription.getEmitter()._events,
        "ethers.js should not be listening to any events."
      ).to.be.empty;
    }

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

  describe("TransactionSubscription - actions (tx) subscriptions tests", async () => {
    let rand;

    beforeEach("assign a wallet to the contract", () => {
      expect(() => {
        simpleStorage.setWallet(wallet);
      }).not.to.throw();

      rand = Math.floor(Math.random() * Math.floor(1000)).toString();
    });

    it("should throw when subscribing with invalid event name", async () => {
      txSubscription = simpleStorage.setValue("hello world");

      expect(() => {
        txSubscription.on("invalid", () => {});
      }).to.throw();
    });

    it("should throw when subscribing without listener", async () => {
      txSubscription = simpleStorage.setValue("hello world");

      expect(() => {
        txSubscription.on("confirmation");
      }).to.throw();
    });

    it("should change contract state and trigger confirmation event one time", async () => {
      txSubscription = simpleStorage.setValue(rand);
      const confirmationFakeFn = sinon.fake();
      const errorFakeFn = sinon.fake();

      const confirmationListener = async message => {
        const { data } = message;
        const { confirmations } = data;

        confirmationFakeFn();

        const value = await simpleStorage.getValue();
        expect(value).to.equal(rand);
      };

      txSubscription.once("confirmation", confirmationListener);

      const errorListener = message => {
        const { error, eventName } = message;
        errorFakeFn();
      };

      txSubscription.on("error", errorListener);

      await mineBlocks(provider, 15);

      txSubscription.off("error");

      expect(confirmationFakeFn.callCount).to.equal(1);
      expect(errorFakeFn.called).to.be.false;
      expect(txSubscription.subscribedEventNames()).to.be.empty;
    });

    it("should change contract state and trigger confirmation event", async () => {
      txSubscription = simpleStorage.setValue(rand);
      const fakeFn = sinon.fake();

      const listener = async message => {
        const { data } = message;
        const { confirmations } = data;

        if (confirmations >= 7) {
          txSubscription.off("confirmation");

          const value = await simpleStorage.getValue();
          expect(value).to.equal(rand);

          fakeFn();
        }
      };

      txSubscription.on("confirmation", listener);

      await mineBlocks(provider, 15);

      expect(fakeFn.callCount).to.be.at.most(7);
    });

    it("should change contract state and trigger confirmation event - late subscription", async () => {
      txSubscription = simpleStorage.setValue(rand);
      const fakeFn = sinon.fake();

      const listener = async message => {
        const { data } = message;
        const { confirmations } = data;

        if (confirmations >= 7) {
          txSubscription.off("confirmation");

          const value = await simpleStorage.getValue();
          expect(value).to.equal(rand);
          fakeFn();
        }
      };

      txSubscription.on("confirmation", listener);

      await mineBlocks(provider, 20);

      await txSubscription.waitForNonceToUpdate();

      expect(fakeFn.called).to.be.true;
    });

    it("should call error listener after timeout", async () => {
      txSubscription = simpleStorage.setValue("hello world");
      txSubscription.setEventsTimeout(100);

      const errorFn = sinon.fake();
      const confirmationFn = sinon.fake();

      const foreverListener = message => {
        confirmationFn();
      };

      txSubscription.on("confirmation", foreverListener);

      const errorListener = message => {
        const { error, eventName } = message;
        expect(error.message).to.equal("Event confirmation reached timeout.");
        errorFn();
      };

      txSubscription.on("error", errorListener);

      await mineBlocks(provider, 10);

      // TODO: Use fake timer
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(errorFn.called).to.be.true;
      expect(confirmationFn.called).to.be.true;
      expect(txSubscription.subscribedEventNames()).to.deep.equal([
        "confirmation",
        "error",
      ]);
    });

    it("subscription should have one listener per event", async () => {
      txSubscription = simpleStorage.setValue("hello world");

      const listener1 = message => {};
      const listener2 = message => {};

      expect(txSubscription.subscribedEventNames()).to.be.empty;

      txSubscription.on("confirmation", listener1);

      expect(() => {
        txSubscription.on("confirmation", listener2);
      }).to.throw();

      expect(txSubscription.subscribedEventNames()).to.deep.equal([
        "confirmation",
      ]);
    });

    it("should remove an event", async () => {
      txSubscription = simpleStorage.setValue("hello world");

      const listener1 = message => {};

      expect(txSubscription.subscribedEventNames()).to.be.empty;

      txSubscription.on("confirmation", listener1);

      expect(txSubscription.subscribedEventNames()).to.deep.equal([
        "confirmation",
      ]);

      txSubscription.off("confirmation");

      expect(txSubscription.subscribedEventNames()).to.be.empty;
    });

    it("should emit error event when orphan/uncle block occurs", async () => {
      txSubscription = simpleStorage.setValue("hello world");

      const confirmationFn = sinon.fake();
      const errorFn = sinon.fake();

      const confirmationListener = message => {
        confirmationFn();
      };

      txSubscription.on("confirmation", confirmationListener);

      const errorListener = message => {
        const { error, eventName } = message;
        txSubscription.off("confirmation");

        // Note: This assertion will not fail the test case (UnhandledPromiseRejectionWarning)
        expect(error.message).to.equal(
          "Your message has been included in an uncle block."
        );

        // But asserting fake function, if that throws, test case will fail.
        errorFn();
      };

      txSubscription.on("error", errorListener);

      const snapshotId = await createSnapshot(provider);

      await mineBlocks(provider, 15);

      expect(confirmationFn.called).to.be.true;

      await revertFromSnapshot(provider, snapshotId);

      await mineBlocks(provider, 20);

      // Broadcast same transaction again (simulate reorg)
      txSubscription = simpleStorage.setValue("hello world");

      expect(errorFn.called).to.be.true;
    });
  });

  describe("ContractSubscription - contract events subscription", async () => {
    beforeEach("assign a wallet to the contract", () => {
      expect(() => {
        simpleStorage.setWallet(wallet);
      }).not.to.throw();
    });

    it("should trigger an event one time when you're listening to that event and the contract triggers it", async () => {
      contractSubscription = simpleStorage.subscribe();
      const fakeFn = sinon.fake();
      const errorFakeFn = sinon.fake();

      const errorListener = message => {
        console.log(message);
        const { error, eventName } = message;
        errorFakeFn();
      };

      contractSubscription.on("error", errorListener);

      txSubscription = simpleStorage.setValue("hello world");

      // Is possible do that using async/await?
      // If not, TODO: Make a function
      await new Promise(function(resolve, reject) {
        contractSubscription.once("ValueChanged", message => {
          const { data } = message;
          const { args } = data;

          fakeFn();

          resolve();
        });
      });

      contractSubscription.off("error");
      contractSubscription.off("ValueChanged");

      expect(errorFakeFn.called).to.be.false;
      expect(fakeFn.callCount).to.equal(1);
      expect(contractSubscription.subscribedEventNames()).to.be.empty;
    });

    it("should be able to listen to an event triggered by the contract", async () => {
      contractSubscription = simpleStorage.subscribe();
      const fakeFn = sinon.fake();
      const errorFakeFn = sinon.fake();

      const errorListener = message => {
        console.log(message);
        const { error, eventName } = message;
        errorFakeFn();
      };

      contractSubscription.on("error", errorListener);

      txSubscription = simpleStorage.setValue("hello world");

      // Is possible do that using async/await?
      // If not, TODO: Make a function
      await new Promise(function(resolve, reject) {
        contractSubscription.on("ValueChanged", message => {
          const { data } = message;
          const { args } = data;

          fakeFn();
          resolve();
        });
      });

      contractSubscription.off("error");

      expect(errorFakeFn.called).to.be.false;
      expect(fakeFn.callCount).to.equal(1);
    });

    it("should throw error when listening on invalid event", async () => {
      contractSubscription = simpleStorage.subscribe();

      expect(() => {
        contractSubscription.on("InvalidEvent", () => {});
      }).to.throw();
    });

    it("subscription should have one listener per event", async () => {
      contractSubscription = simpleStorage.subscribe();

      const listener1 = message => {
        console.log("1");
      };
      const listener2 = message => {
        console.log("2");
      };

      expect(contractSubscription.subscribedEventNames()).to.be.empty;

      contractSubscription.on("ValueChanged", listener1);

      expect(() => {
        contractSubscription.on("ValueChanged", listener2);
      }).to.throw();

      expect(contractSubscription.subscribedEventNames()).to.deep.equal([
        "ValueChanged",
      ]);
    });

    it("should remove an event", async () => {
      contractSubscription = simpleStorage.subscribe();

      const listener1 = message => {};

      expect(contractSubscription.subscribedEventNames()).to.be.empty;

      contractSubscription.on("ValueChanged", listener1);

      expect(contractSubscription.subscribedEventNames()).to.deep.equal([
        "ValueChanged",
      ]);

      contractSubscription.off("ValueChanged");

      expect(contractSubscription.subscribedEventNames()).to.be.empty;
    });

    it("should manage many listeners", async () => {
      contractSubscription = simpleStorage.subscribe();

      const listener1 = message => {};
      const listener2 = message => {};
      const listener3 = message => {};

      expect(contractSubscription.subscribedEventNames()).to.be.empty;

      contractSubscription.on("ValueChanged", listener1);
      contractSubscription.on("ValueRemoved", listener2);

      expect(contractSubscription.subscribedEventNames()).to.deep.equal([
        "ValueChanged",
        "ValueRemoved",
      ]);

      contractSubscription.off("ValueRemoved");

      expect(contractSubscription.subscribedEventNames()).to.deep.equal([
        "ValueChanged",
      ]);

      contractSubscription.on("ValueRemoved", listener3);

      expect(contractSubscription.subscribedEventNames()).to.deep.equal([
        "ValueChanged",
        "ValueRemoved",
      ]);

      contractSubscription.unsubscribe();

      expect(contractSubscription.subscribedEventNames()).to.be.empty;
    });
  });

  // Send method interface: Contract.send(tx: msg, bool: free) => Subscription
  // On free send how know if identity-contract should be used?
  it.skip("should send a signed message", async () => {});
});
