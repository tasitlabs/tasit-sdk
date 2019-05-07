import Contract from "./Contract";
import TasitContracts from "tasit-contracts";
import ProviderFactory from "../ProviderFactory";
import {
  accounts,
  mineBlocks,
  wait,
  createSnapshot,
  revertFromSnapshot,
} from "../testHelpers/helpers";

const { local: localContracts } = TasitContracts;
const { SampleContract } = localContracts;
const {
  abi: sampleContractABI,
  address: SAMPLE_CONTRACT_ADDRESS,
} = SampleContract;
const provider = ProviderFactory.getProvider();

describe("TasitAction.Contract", () => {
  let sampleContract;
  let wallet;
  let action;

  beforeEach("should connect to an existing contract", async () => {
    if (action) {
      expect(action.subscribedEventNames()).to.be.empty;
    }

    sampleContract = undefined;
    wallet = undefined;
    action = undefined;

    [wallet] = accounts;

    sampleContract = new Contract(SAMPLE_CONTRACT_ADDRESS, sampleContractABI);
    expect(sampleContract).to.exist;
    expect(sampleContract.getAddress()).to.equal(SAMPLE_CONTRACT_ADDRESS);
    expect(sampleContract.getValue).to.exist;
    expect(sampleContract.setValue).to.exist;
    expect(sampleContract._getProvider()).to.exist;
    expect(sampleContract.getABI()).to.deep.equal(sampleContractABI);
  });

  afterEach("revert blockchain snapshot", async () => {
    if (sampleContract) {
      sampleContract.unsubscribe();

      expect(
        sampleContract.getEmitter()._events,
        "ethers.js should not be listening to any events."
      ).to.be.empty;
    }

    if (action) {
      await action.waitForOneConfirmation();
      action.unsubscribe();

      expect(
        action.getEmitter()._events,
        "ethers.js should not be listening to any events."
      ).to.be.empty;
    }
  });

  describe("should throw error when instantiated with invalid args", () => {
    it("constructor without address and ABI", async () => {
      expect(() => {
        new Contract();
      }).to.throw();
    });

    it("constructor without ABI", async () => {
      expect(() => {
        new Contract(SAMPLE_CONTRACT_ADDRESS);
      }).to.throw();
    });

    it("constructor without address but with ABI", async () => {
      expect(() => {
        new Contract(null, sampleContractABI);
      }).to.throw();
    });

    it("constructor with invalid address and valid ABI", async () => {
      expect(() => {
        new Contract("invalid address", sampleContractABI);
      }).to.throw();
    });

    it("constructor with valid address and invalid ABI", async () => {
      expect(() => {
        new Contract(SAMPLE_CONTRACT_ADDRESS, "invalid abi");
      }).to.throw();
    });
  });

  it("should call a read-only contract method", async () => {
    const value = await sampleContract.getValue();
    expect(value).to.exist;
  });

  describe("wallet/account setup tests", async () => {
    it("should throw error when setting a wallet with no wallet argument", async () => {
      expect(() => {
        sampleContract.setWallet();
      }).to.throw();
    });

    it("should throw error when setting invalid wallet", async () => {
      expect(() => {
        sampleContract.setWallet("invalid wallet");
      }).to.throw();
    });

    it("should throw error when calling write method without account/wallet", async () => {
      expect(() => {
        sampleContract.setValue("hello world");
      }).to.throw();
    });

    it("should throw error when calling write method after account/wallet removal", async () => {
      sampleContract.setWallet(wallet);
      sampleContract.removeWallet();
      expect(() => {
        sampleContract.setValue("hello world");
      }).to.throw();
    });
  });

  describe("Contract errors behavior", async () => {
    beforeEach("assign a wallet to the contract", () => {
      expect(() => {
        sampleContract.setWallet(wallet);
      }).not.to.throw();
    });

    describe("should trigger Contract error event", async () => {
      it("on action error", async () => {
        const errorListener = sinon.fake();

        sampleContract.on("error", errorListener);

        action = sampleContract.revertWrite("some string");
        await action.send();

        // Some error (orphan block, failed tx) events are being triggered only from the confirmationListener
        // See more: https://github.com/tasitlabs/TasitSDK/issues/253
        action.on("confirmation", () => {});

        await action.waitForOneConfirmation();

        await mineBlocks(provider, 2);

        expect(errorListener.callCount).to.be.at.least(1);
      });

      it("and Action error event on action error", async () => {
        const contractErrorListener = sinon.fake(error => {
          const { message } = error;
          console.info(message);
        });

        sampleContract.on("error", contractErrorListener);

        action = sampleContract.revertWrite("some string");

        // Some error (orphan block, failed tx) events are being triggered only from the confirmationListener
        // See more: https://github.com/tasitlabs/TasitSDK/issues/253
        action.on("confirmation", () => {});

        const actionErrorListener = sinon.fake(error => {
          const { message } = error;
          console.info(message);

          action.off("error");
        });

        action.on("error", actionErrorListener);

        await action.send();

        await action.waitForOneConfirmation();

        await mineBlocks(provider, 1);

        expect(contractErrorListener.callCount).to.equal(1);
        expect(actionErrorListener.callCount).to.equal(1);
      });

      it("on contract event listener error", done => {
        action = sampleContract.setValue("hello world");

        const errorListener = sinon.fake(error => {
          const { message } = error;
          console.info(message);

          expect(eventListener.callCount).to.be.at.least(1);
          done();
        });
        const eventListener = sinon.fake.throws(new Error());

        sampleContract.on("error", errorListener);
        sampleContract.on("ValueChanged", eventListener);

        action.send();
      });
    });

    it("throw error on revert read function", async () => {
      await expect(sampleContract.revertRead()).to.be.rejected;
    });
  });

  describe("Transactions (Actions) Subscription", async () => {
    let rand;

    beforeEach("assign a wallet to the contract", () => {
      expect(() => {
        sampleContract.setWallet(wallet);
      }).not.to.throw();

      rand = Math.floor(Math.random() * Math.floor(1000)).toString();
    });

    it("should throw when subscribing with invalid event name", async () => {
      action = sampleContract.setValue("hello world");
      await action.send();

      expect(() => {
        action.on("invalid", () => {});
      }).to.throw();
    });

    it("should throw when subscribing without listener", async () => {
      action = sampleContract.setValue("hello world");
      await action.send();

      expect(() => {
        action.on("confirmation");
      }).to.throw();
    });

    it("should change contract state and trigger confirmation event one time", async () => {
      action = sampleContract.setValue(rand);
      await action.send();

      // Waiting for 1st confirmation
      // For now ganache always mine a block after transaction creation
      // To avoid non-determinism it's recommended to wait that first confirmation if it could affect the test case result
      // See more: https://github.com/trufflesuite/ganache-core/issues/248#issuecomment-455354557
      await action.waitForOneConfirmation();

      const errorListener = sinon.fake();

      const confirmationListener = sinon.fake(async () => {
        const value = await sampleContract.getValue();
        expect(value).to.equal(rand);

        action.off("confirmation");
      });

      action.on("error", errorListener);

      action.once("confirmation", confirmationListener);

      await mineBlocks(provider, 2);

      expect(confirmationListener.callCount).to.equal(1);
      expect(errorListener.called).to.be.false;

      action.off("error");

      expect(action.subscribedEventNames()).to.be.empty;
    });

    it("should change contract state and trigger confirmation event", async () => {
      action = sampleContract.setValue(rand);
      await action.send();

      await action.waitForOneConfirmation();

      const confirmationListener = sinon.fake(async message => {
        const { data } = message;
        const { confirmations } = data;

        if (confirmations >= 7) {
          action.off("confirmation");

          const value = await sampleContract.getValue();
          expect(value).to.equal(rand);
        }
      });

      const errorListener = sinon.fake();

      action.on("error", errorListener);
      action.on("confirmation", confirmationListener);

      await mineBlocks(provider, 7);

      expect(confirmationListener.callCount).to.equal(6);
      expect(errorListener.called).to.be.false;
    });

    it("should change contract state and trigger confirmation event - late subscription", async () => {
      action = sampleContract.setValue(rand);
      await action.send();
      await action.waitForOneConfirmation();

      await mineBlocks(provider, 5);

      const errorListener = sinon.fake();

      const confirmationListener = sinon.fake(async message => {
        const { data } = message;
        const { confirmations } = data;

        if (confirmations >= 7) {
          action.off("confirmation");

          const value = await sampleContract.getValue();
          expect(value).to.equal(rand);
        }
      });

      action.on("error", errorListener);
      action.on("confirmation", confirmationListener);

      await mineBlocks(provider, 2);

      // Non-deterministic
      expect(confirmationListener.callCount).to.be.at.least(1);
      expect(errorListener.called).to.be.false;
    });

    // Non-deterministic test case
    it.skip("should call error listener after timeout", async () => {
      action = sampleContract.setValue("hello world");
      action.setEventsTimeout(100);

      const errorListener = sinon.fake(error => {
        expect(error.eventName).to.equal("confirmation");
        expect(error.message).to.equal("Event confirmation reached timeout.");
        action.off("error");
      });

      const confirmationListener = sinon.fake(() => {
        action.off("confirmation");
      });

      action.on("confirmation", confirmationListener);

      action.on("error", errorListener);

      await action.send();
      await action.waitForOneConfirmation();

      await mineBlocks(provider, 2);

      // TODO: Use fake timer when Sinon/Lolex supports it.
      // See more:
      //  https://github.com/sinonjs/sinon/issues/1739
      //  https://github.com/sinonjs/lolex/issues/114
      //  https://stackoverflow.com/a/50785284
      await wait(action.getEventsTimeout() * 5);

      await mineBlocks(provider, 2);

      expect(errorListener.callCount).to.equal(1);
      expect(confirmationListener.callCount).to.equal(1);
      expect(action.subscribedEventNames()).to.deep.equal([
        "error",
        "confirmation",
      ]);
    });

    it("subscription should have one listener per event", async () => {
      action = sampleContract.setValue("hello world");
      await action.send();

      const listener1 = () => {};
      const listener2 = () => {};

      expect(action.subscribedEventNames()).to.deep.equal(["error"]);

      action.on("confirmation", listener1);

      expect(() => {
        action.on("confirmation", listener2);
      }).to.throw();

      expect(action.subscribedEventNames()).to.deep.equal([
        "error",
        "confirmation",
      ]);
    });

    it("should remove an event", async () => {
      action = sampleContract.setValue("hello world");
      await action.send();

      const listener1 = () => {};

      expect(action.subscribedEventNames()).to.deep.equal(["error"]);

      action.on("confirmation", listener1);

      expect(action.subscribedEventNames()).to.deep.equal([
        "error",
        "confirmation",
      ]);

      action.off("confirmation");

      expect(action.subscribedEventNames()).to.deep.equal(["error"]);
    });

    // Note: Block reorganization is the situation where a client discovers a
    //  new difficultywise-longest well-formed blockchain which excludes one or more blocks that
    //  the client previously thought were part of the difficultywise-longest well-formed blockchain.
    //  These excluded blocks become orphans.
    it("should emit error event when block reorganization occurs - block excluded", async () => {
      const confirmationFn = sinon.fake();
      const errorFn = sinon.fake();

      const confirmationListener = () => {
        confirmationFn();
      };

      const errorListener = error => {
        const { message } = error;
        // Note: This assertion will not fail the test case (UnhandledPromiseRejectionWarning)
        expect(message).to.equal(
          "Your action's position in the chain has changed in a surprising way."
        );

        // But asserting fake function, if that throws, test case will fail.
        errorFn();
      };

      const snapshotId = await createSnapshot(provider);

      action = sampleContract.setValue("hello world");
      await action.send();

      action.on("confirmation", confirmationListener);

      action.on("error", errorListener);

      await mineBlocks(provider, 2);

      // Non-deterministic
      expect(confirmationFn.callCount).to.be.at.least(1);

      await revertFromSnapshot(provider, snapshotId);

      await mineBlocks(provider, 2);

      // Note: Transaction no longer exists
      // If it isn't unset, afterEach hook will execute waitForOneConfirmation forever
      action.off("confirmation");
      action = undefined;

      // Non-deterministic
      expect(errorFn.callCount).to.be.at.least(1);
    });

    // Note: Block reorganization is the situation where a client discovers a
    //  new difficultywise-longest well-formed blockchain which excludes one or more blocks that
    //  the client previously thought were part of the difficultywise-longest well-formed blockchain.
    //  These excluded blocks become orphans.
    it("should emit error event when block reorganization occurs - tx confirmed twice", async () => {
      const confirmationListener = sinon.fake();
      const errorFn = sinon.fake();

      const errorListener = error => {
        const { message } = error;

        // Note: This assertion will not fail the test case (UnhandledPromiseRejectionWarning)
        expect(message).to.equal(
          "Your action's position in the chain has changed in a surprising way."
        );

        // But asserting fake function, if that throws, test case will fail.
        errorFn();
      };

      action = sampleContract.setValue("hello world");
      await action.send();

      await action.waitForOneConfirmation();

      action.on("error", errorListener);

      action.on("confirmation", confirmationListener);

      await mineBlocks(provider, 1);

      const snapshotId = await createSnapshot(provider);

      await mineBlocks(provider, 2);

      // Non-deterministic
      expect(confirmationListener.callCount).to.be.at.least(1);

      await revertFromSnapshot(provider, snapshotId);

      // Note: Without that, ethers.provider will keep the same
      // receipt.confirmations as before snapshot reversion
      // See more: https://github.com/ethers-io/ethers.js/issues/385#issuecomment-455187735
      action._refreshProvider();

      await mineBlocks(provider, 2);

      // not always on the first new block because of pollingInterval vs blockTime issue
      // but the first poll after that 15 new blocks is emitting error event
      // Non-deterministic
      expect(errorFn.callCount).to.be.at.least(1);
    });

    it("should get action id (transactionHash)", async () => {
      action = sampleContract.setValue(rand);
      await action.send();

      const actionId = await action.getId();

      expect(actionId).to.be.an("string");
      expect(actionId).to.have.lengthOf(66);
    });

    it("should be able to listen to an event before sending", async () => {
      const confirmationListener = sinon.fake(async () => {
        action.off("confirmation");
      });

      const errorListener = sinon.fake();

      action = sampleContract.setValue(rand);
      action.on("error", errorListener);
      action.on("confirmation", confirmationListener);

      await mineBlocks(provider, 2);

      await action.send();
      await action.waitForOneConfirmation();

      await mineBlocks(provider, 2);

      // Non-determinitic
      expect(confirmationListener.callCount).to.be.at.least(1);
      expect(errorListener.called).to.be.false;
    });

    it("'once' listener should be unsubscribed only after user listener function was called", async () => {
      action = sampleContract.setValue(rand);

      const errorListener = sinon.fake(error => {
        const { message } = error;
        console.info(message);

        action.off("error");
      });

      const confirmationListener = sinon.fake();

      action.on("error", errorListener);
      action.once("confirmation", confirmationListener);

      // Forcing internal (block) listener to be called before the transaction is sent
      await mineBlocks(provider, 2);

      await action.send();
      await action.waitForOneConfirmation();

      await mineBlocks(provider, 2);

      expect(confirmationListener.called).to.be.true;
      expect(errorListener.called).to.be.false;
    });
  });

  describe("Contract Events Subscription", async () => {
    beforeEach("assign a wallet to the contract", () => {
      expect(() => {
        sampleContract.setWallet(wallet);
      }).not.to.throw();
    });

    it("should trigger an event one time when you're listening to that event and the contract triggers it", done => {
      action = sampleContract.setValue("hello world");

      const valueChangedListener = sinon.fake(() => {
        sampleContract.off("error");
        expect(sampleContract.subscribedEventNames()).to.be.empty;
        done();
      });

      const errorListener = sinon.fake(error => {
        done(error);
      });

      sampleContract.on("error", errorListener);
      sampleContract.once("ValueChanged", valueChangedListener);

      action.send();
    });

    it("should be able to listen to an event triggered by the contract", done => {
      action = sampleContract.setValue("hello world");

      const errorListener = sinon.fake(error => {
        done(error);
      });

      const valueChangedListener = sinon.fake(() => {
        sampleContract.off("ValueChanged");
        sampleContract.off("error");
        done();
      });

      sampleContract.on("error", errorListener);
      sampleContract.on("ValueChanged", valueChangedListener);

      action.send();
    });

    it("should throw error when listening on invalid event", async () => {
      expect(() => {
        sampleContract.on("InvalidEvent", () => {});
      }).to.throw();
    });

    it("subscription should have one listener per event", async () => {
      const listener1 = () => {};
      const listener2 = () => {};

      expect(sampleContract.subscribedEventNames()).to.be.empty;

      sampleContract.on("ValueChanged", listener1);

      expect(() => {
        sampleContract.on("ValueChanged", listener2);
      }).to.throw();

      expect(sampleContract.subscribedEventNames()).to.deep.equal([
        "ValueChanged",
      ]);
    });

    it("should remove an event", async () => {
      const listener1 = () => {};

      expect(sampleContract.subscribedEventNames()).to.be.empty;

      sampleContract.on("ValueChanged", listener1);

      expect(sampleContract.subscribedEventNames()).to.deep.equal([
        "ValueChanged",
      ]);

      sampleContract.off("ValueChanged");

      expect(sampleContract.subscribedEventNames()).to.be.empty;
    });

    it("should manage many listeners", async () => {
      const listener1 = () => {};
      const listener2 = () => {};
      const listener3 = () => {};

      expect(sampleContract.subscribedEventNames()).to.be.empty;

      sampleContract.on("ValueChanged", listener1);
      sampleContract.on("ValueRemoved", listener2);

      expect(sampleContract.subscribedEventNames()).to.deep.equal([
        "ValueChanged",
        "ValueRemoved",
      ]);

      sampleContract.off("ValueRemoved");

      expect(sampleContract.subscribedEventNames()).to.deep.equal([
        "ValueChanged",
      ]);

      sampleContract.on("ValueRemoved", listener3);

      expect(sampleContract.subscribedEventNames()).to.deep.equal([
        "ValueChanged",
        "ValueRemoved",
      ]);

      sampleContract.unsubscribe();

      expect(sampleContract.subscribedEventNames()).to.be.empty;
    });
  });

  // Send method interface: Contract.send(tx: msg, bool: free) => Subscription
  // On free send how know if contract-based-account should be used?
  it.skip("should send a signed message", async () => {});
});
