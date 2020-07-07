import sinon from "sinon";

import Contract from "./Contract";

// In order to test the action package in a meaningful way, it needs
// to be able to interact with contracts.
import TasitContracts from "@tasit/contracts";
import ProviderFactory from "../ProviderFactory";
import {
  accounts,
  mineBlocks,
  createSnapshot,
  revertFromSnapshot,
} from "@tasit/test-helpers";

const { local: localContracts } = TasitContracts;
const { SampleContract } = localContracts;
const {
  abi: sampleContractABI,
  address: SAMPLE_CONTRACT_ADDRESS,
} = SampleContract;
const provider = ProviderFactory.getProvider();

describe("TasitAction.Contract", () => {
  let sampleContract;
  let account;
  let action;
  let contractAbiString;

  // should connect to an existing contract
  beforeEach(async () => {
    await provider.ready;
    if (action) {
      expect(action.subscribedEventNames()).toHaveLength(0);
    }

    sampleContract = undefined;
    account = undefined;
    action = undefined;

    [account] = accounts;

    contractAbiString = sampleContractABI.toString();

    sampleContract = new Contract(SAMPLE_CONTRACT_ADDRESS, contractAbiString);
    expect(sampleContract).toBeTruthy();
    expect(sampleContract.getAddress()).toEqual(SAMPLE_CONTRACT_ADDRESS);
    expect(sampleContract.getValue).toBeTruthy();
    expect(sampleContract.setValue).toBeTruthy();
    expect(sampleContract._getProvider()).toBeTruthy();
    expect(sampleContract.getABI()).toEqual(sampleContractABI);
  });

  // revert blockchain snapshot
  afterEach(async () => {
    if (sampleContract) {
      sampleContract.unsubscribe();

      expect(sampleContract.getEmitter()._events).toHaveLength(0);
    }

    if (action) {
      await action.waitForOneConfirmation();
      action.unsubscribe();

      expect(action.getEmitter()._events).toHaveLength(0);
    }
  });

  describe("should throw error when instantiated with invalid args", () => {
    it("constructor without address and ABI", async () => {
      expect(() => {
        // @ts-ignore: TS2554
        new Contract();
      }).toThrow();
    });

    it("constructor without ABI", async () => {
      expect(() => {
        // @ts-ignore: TS2554
        new Contract(SAMPLE_CONTRACT_ADDRESS);
      }).toThrow();
    });

    it("constructor without address but with ABI", async () => {
      expect(() => {
        // @ts-ignore: TS2345
        new Contract(null, contractAbiString);
      }).toThrow();
    });

    it("constructor with invalid address and valid ABI", async () => {
      expect(() => {
        new Contract("invalid address", contractAbiString);
      }).toThrow();
    });

    it("constructor with valid address and invalid ABI", async () => {
      expect(() => {
        new Contract(SAMPLE_CONTRACT_ADDRESS, "invalid abi");
      }).toThrow();
    });
  });

  it("should call a read-only contract method", async () => {
    const value = await sampleContract.getValue();
    expect(value).toBeTruthy();
  });

  describe("account setup tests", () => {
    it("should throw error when setting an account without argument", async () => {
      expect(() => {
        sampleContract.setAccount();
      }).toThrow();
    });

    it("should throw error when setting invalid account", async () => {
      expect(() => {
        sampleContract.setAccount("invalid account");
      }).toThrow();
    });

    it("should throw error when calling write method without account", async () => {
      expect(() => {
        sampleContract.setValue("hello world");
      }).toThrow();
    });

    it("should throw error when calling write method after account removal", async () => {
      sampleContract.setAccount(account);
      sampleContract.removeAccount();
      expect(() => {
        sampleContract.setValue("hello world");
      }).toThrow();
    });
  });

  describe("Contract errors behavior", () => {
    // assign an account to the contract
    beforeEach(() => {
      expect(() => {
        sampleContract.setAccount(account);
      }).not.toThrow();
    });

    describe("should trigger Contract error event", () => {
      it("on action error", async () => {
        const errorListener = sinon.fake();

        sampleContract.on("error", errorListener);

        action = sampleContract.revertWrite("some string");
        await action.send();

        // Some error (orphan block, failed tx) events are being triggered only from the confirmationListener
        // See more: https://github.com/tasitlabs/tasit-sdk/issues/253
        action.on("confirmation", () => {
          // do nothing
        });

        await action.waitForOneConfirmation();

        await mineBlocks(provider, 2);

        expect(errorListener.callCount).toBeGreaterThanOrEqual(1);
      });

      it("and Action error event on action error", async () => {
        const contractErrorListener = sinon.fake(error => {
          const { message } = error;
          console.info(message);
        });

        sampleContract.on("error", contractErrorListener);

        action = sampleContract.revertWrite("some string");

        // Some error (orphan block, failed tx) events are being triggered only from the confirmationListener
        // See more: https://github.com/tasitlabs/tasit-sdk/issues/253
        action.on("confirmation", () => {
          // do nothing
        });

        const actionErrorListener = sinon.fake(error => {
          const { message } = error;
          console.info(message);

          action.off("error");
        });

        action.on("error", actionErrorListener);

        await action.send();

        await action.waitForOneConfirmation();

        await mineBlocks(provider, 1);

        expect(contractErrorListener.callCount).toEqual(1);
        expect(actionErrorListener.callCount).toEqual(1);
      });

      it("on contract event listener error", done => {
        action = sampleContract.setValue("hello world");

        const errorListener = sinon.fake(error => {
          const { message } = error;
          console.info(message);

          expect(eventListener.callCount).toBeGreaterThanOrEqual(1);
          done();
        });
        const eventListener = sinon.fake.throws(new Error());

        sampleContract.on("error", errorListener);
        sampleContract.on("ValueChanged", eventListener);

        action.send();
      });
    });

    it("throw error on revert read function", async () => {
      await expect(sampleContract.revertRead()).rejects.toThrow();
    });
  });

  describe("Transactions (Actions) Subscription", () => {
    let rand;

    // assign an account to the contract
    beforeEach(() => {
      expect(() => {
        sampleContract.setAccount(account);
      }).not.toThrow();

      rand = Math.floor(Math.random() * Math.floor(1000)).toString();
    });

    it("should throw when subscribing with invalid event name", async () => {
      action = sampleContract.setValue("hello world");
      await action.send();

      expect(() => {
        action.on("invalid", () => {
          // do nothing
        });
      }).toThrow();
    });

    it("should throw when subscribing without listener", async () => {
      action = sampleContract.setValue("hello world");
      await action.send();

      expect(() => {
        action.on("confirmation");
      }).toThrow();
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
        expect(value).toEqual(rand);

        action.off("confirmation");
      });

      action.on("error", errorListener);

      action.once("confirmation", confirmationListener);

      await mineBlocks(provider, 2);

      expect(confirmationListener.callCount).toEqual(1);
      expect(errorListener.called).toBe(false);

      action.off("error");

      expect(action.subscribedEventNames()).toHaveLength(0);
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
          expect(value).toEqual(rand);
        }
      });

      const errorListener = sinon.fake();

      action.on("error", errorListener);
      action.on("confirmation", confirmationListener);

      await mineBlocks(provider, 7);

      expect(confirmationListener.callCount).toEqual(6);
      expect(errorListener.called).toBe(false);
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
          expect(value).toEqual(rand);
        }
      });

      action.on("error", errorListener);
      action.on("confirmation", confirmationListener);

      await mineBlocks(provider, 2);

      // Non-deterministic
      expect(confirmationListener.callCount).toBeGreaterThanOrEqual(1);
      expect(errorListener.called).toBe(false);
    });

    it("action should call error listener after timeout", done => {
      action = sampleContract.setValue("hello world");
      action.setTimeout(100);

      const errorListener = sinon.fake(error => {
        const { eventName, message } = error;
        expect(eventName).toEqual("confirmation");
        expect(message).toEqual("Event confirmation reached timeout.");
        expect(action.subscribedEventNames()).toEqual([
          "error",
          "confirmation",
        ]);
        action.off("error");
        action.off("confirmation");
        done();
      });

      const confirmationListener = sinon.fake(() => {
        // do nothing
      });

      action.on("confirmation", confirmationListener);
      action.on("error", errorListener);

      // Note: Sending this triggers a block being mined,
      // and since no additional blocks will be mined,
      // the timeout will be reached before another confirmation occurs
      action.send();
    });

    it("subscription should have one listener per event", async () => {
      action = sampleContract.setValue("hello world");
      await action.send();

      const listener1 = () => {
        // do nothing
      };
      const listener2 = () => {
        // do nothing
      };

      expect(action.subscribedEventNames()).toEqual(["error"]);

      action.on("confirmation", listener1);

      expect(() => {
        action.on("confirmation", listener2);
      }).toThrow();

      expect(action.subscribedEventNames()).toEqual(["error", "confirmation"]);
    });

    it("should remove an event", async () => {
      action = sampleContract.setValue("hello world");
      await action.send();

      const listener1 = () => {
        // do nothing
      };

      expect(action.subscribedEventNames()).toEqual(["error"]);

      action.on("confirmation", listener1);

      expect(action.subscribedEventNames()).toEqual(["error", "confirmation"]);

      action.off("confirmation");

      expect(action.subscribedEventNames()).toEqual(["error"]);
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
        expect(message).toEqual(
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
      expect(confirmationFn.callCount).toBeGreaterThanOrEqual(1);

      await revertFromSnapshot(provider, snapshotId);

      await mineBlocks(provider, 2);

      // Note: Transaction no longer exists
      // If it isn't unset, afterEach hook will execute waitForOneConfirmation forever
      action.off("confirmation");
      action = undefined;

      // Non-deterministic
      expect(errorFn.callCount).toBeGreaterThanOrEqual(1);
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
        expect(message).toEqual(
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
      expect(confirmationListener.callCount).toBeGreaterThanOrEqual(1);

      await revertFromSnapshot(provider, snapshotId);

      // Note: Without that, ethers.provider will keep the same
      // receipt.confirmations as before snapshot reversion
      // See more: https://github.com/ethers-io/ethers.js/issues/385#issuecomment-455187735
      action._refreshProvider();

      await mineBlocks(provider, 2);

      // not always on the first new block because of pollingInterval vs blockTime issue
      // but the first poll after that 15 new blocks is emitting error event
      // Non-deterministic
      expect(errorFn.callCount).toBeGreaterThanOrEqual(1);
    });

    it("should get action id (transactionHash)", async () => {
      action = sampleContract.setValue(rand);
      await action.send();

      const actionId = await action.getId();

      expect(typeof actionId).toBe("string");
      expect(actionId).toHaveLength(66);
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
      expect(confirmationListener.callCount).toBeGreaterThanOrEqual(1);
      expect(errorListener.called).toBe(false);
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

      expect(confirmationListener.called).toBe(true);
      expect(errorListener.called).toBe(false);
    });
  });

  describe("Contract Events Subscription", () => {
    // assign an account to the contract
    beforeEach(() => {
      expect(() => {
        sampleContract.setAccount(account);
      }).not.toThrow();
    });

    it("should trigger an event one time when you're listening to that event and the contract triggers it", done => {
      action = sampleContract.setValue("hello world");

      const valueChangedListener = sinon.fake(() => {
        sampleContract.off("error");
        expect(sampleContract.subscribedEventNames()).toHaveLength(0);
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

    // Non-deterministic test
    it.skip("contract should call error listener after timeout", done => {
      sampleContract.setTimeout(100);
      action = sampleContract.setValue("hello world");

      const errorListener = sinon.fake(error => {
        const { eventName, message } = error;
        expect(eventName).toEqual("ValueChanged");
        expect(message).toEqual("Event ValueChanged reached timeout.");
        expect(sampleContract.subscribedEventNames()).toEqual([
          "ValueChanged",
          "error",
        ]);
        sampleContract.off("error");
        sampleContract.off("ValueChanged");
        done();
      });

      const confirmationListener = sinon.fake(() => {
        // do nothing
      });

      sampleContract.on("ValueChanged", confirmationListener);
      sampleContract.on("error", errorListener);

      // Note: Sending this triggers a block being mined,
      // and since no additional blocks will be mined,
      // the timeout will be reached before another confirmation occurs
      action.send();
    });

    it("should throw error when listening on invalid event", async () => {
      expect(() => {
        sampleContract.on("InvalidEvent", () => {
          // do nothing
        });
      }).toThrow();
    });

    it("subscription should have one listener per event", async () => {
      const listener1 = () => {
        // do nothing
      };
      const listener2 = () => {
        // do nothing
      };

      expect(sampleContract.subscribedEventNames()).toHaveLength(0);

      sampleContract.on("ValueChanged", listener1);

      expect(() => {
        sampleContract.on("ValueChanged", listener2);
      }).toThrow();

      expect(sampleContract.subscribedEventNames()).toEqual(["ValueChanged"]);
    });

    it("should remove an event", async () => {
      const listener1 = () => {
        // do nothing
      };

      expect(sampleContract.subscribedEventNames()).toHaveLength(0);

      sampleContract.on("ValueChanged", listener1);

      expect(sampleContract.subscribedEventNames()).toEqual(["ValueChanged"]);

      sampleContract.off("ValueChanged");

      expect(sampleContract.subscribedEventNames()).toHaveLength(0);
    });

    it("should manage many listeners", async () => {
      const listener1 = () => {
        // do nothing
      };
      const listener2 = () => {
        // do nothing
      };
      const listener3 = () => {
        // do nothing
      };

      expect(sampleContract.subscribedEventNames()).toHaveLength(0);

      sampleContract.on("ValueChanged", listener1);
      sampleContract.on("ValueRemoved", listener2);

      expect(sampleContract.subscribedEventNames()).toEqual([
        "ValueChanged",
        "ValueRemoved",
      ]);

      sampleContract.off("ValueRemoved");

      expect(sampleContract.subscribedEventNames()).toEqual(["ValueChanged"]);

      sampleContract.on("ValueRemoved", listener3);

      expect(sampleContract.subscribedEventNames()).toEqual([
        "ValueChanged",
        "ValueRemoved",
      ]);

      sampleContract.unsubscribe();

      expect(sampleContract.subscribedEventNames()).toHaveLength(0);
    });
  });

  // Send method interface: Contract.send(tx: msg, bool: free) => Subscription
  // On free send how know if contract-based-account should be used?
  it.skip("should send a signed message", async () => {
    // do nothing
  });
});
