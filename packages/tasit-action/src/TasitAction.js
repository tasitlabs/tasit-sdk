import "ethers/dist/shims.js";
// Note: ethers SHOULD be imported from their main object
// shims aren't injected with package import
import { ethers } from "ethers";
import EventEmitter from "events";
// TODO: Get via config file
const DEFAULT_TIMEOUT = 2000;

class Utils {
  static isAddress = address => {
    return typeof address === "string" && address.match(/^0x[0-9A-Fa-f]{40}$/);
  };

  static isABI = abi => {
    return abi && Array.isArray(abi);
  };

  // https://github.com/ethers-io/ethers.js/blob/db383a3121bb8cf5c80c5488e853101d8c1df353/src.ts/utils/properties.ts#L20
  static isEthersJsSigner = signer => {
    return signer && signer._ethersType === "Signer";
  };
}

class Subscription {
  #timeout = DEFAULT_TIMEOUT;
  #emitter;
  #events = [];

  constructor(eventEmitter) {
    this.#emitter = eventEmitter;
  }

  removeListener = (eventName, listener) => {
    this.#events = this.#events.filter(event => {
      if (event.eventName === eventName && event.listener === listener) {
        this.#emitter.removeListener(
          event.wrappedEventName,
          event.wrappedListener
        );
        return false;
      }
      return true;
    });
  };

  off = (eventName, listener) => {
    this.removeListener(eventName, listener);
  };

  listenerCount = eventName => {
    return this.#events.filter(event => {
      return event.eventName === eventName;
    }).length;
  };

  removeAllListeners = () => {
    this.#events.forEach(event => {
      this.removeListener(event.eventName, event.listener);
    });
  };

  unsubscribe = () => {
    this.removeAllListeners();
  };

  // TODO: Make private
  emitErrorEvent = error => {
    this.#events.forEach(event => {
      if (event.eventName === "error") {
        event.listener(error);
      }
    });
  };

  addErrorListener = listener => {
    const eventName = "error";
    this.#events.push({
      eventName,
      wrappedEventName: eventName,
      listener,
      wrappedListener: listener,
    });
  };

  // TODO: Make private
  addListener = (eventName, wrappedEventName, listener, wrappedListener) => {
    this.#emitter.on(wrappedEventName, wrappedListener);

    this.#events.push({
      eventName,
      wrappedEventName,
      listener,
      wrappedListener,
    });

    setTimeout(() => {
      this.emitErrorEvent(new Error(`Listener removed after reached timeout`));
      this.removeListener(eventName, listener);
    }, this.#timeout);
  };
}

class TransactionSubscription extends Subscription {
  #txPromise;
  #provider;
  #tx;

  constructor(txPromise, provider) {
    super(provider);
    this.#txPromise = txPromise;
    this.#provider = provider;
  }

  on = async (eventName, listener) => {
    const triggers = ["confirmation", "error"];

    if (!triggers.includes(eventName)) {
      throw new Error(`Invalid listener trigger, use: [${triggers}]`);
    }

    if (!listener || typeof listener !== "function") {
      throw new Error(`Cannot listening without a function`);
    }

    if (eventName === "error") {
      this.addErrorListener(listener);
      return;
    }

    this.#tx = await this.#txPromise;

    let wrappedListener = async receipt => {
      const { confirmations } = receipt;
      const message = {
        data: {
          confirmations: confirmations,
        },
      };

      try {
        await listener(message);
      } catch (error) {
        this.emitErrorEvent(
          new Error(`Callback function with error: ${error.message}`)
        );
      }
    };

    const receipt = await this.#provider.getTransactionReceipt(this.#tx.hash);
    const alreadyMined = receipt != null;

    if (alreadyMined) {
      this.addListener(eventName, "block", listener, async () => {
        const receipt = await this.#provider.getTransactionReceipt(
          this.#tx.hash
        );
        wrappedListener(receipt);
      });
    } else {
      this.addListener(eventName, this.#tx.hash, listener, wrappedListener);
    }
  };

  // Tech debt
  // This method avoid duplicated nonce generation when rapid succession of several transactions
  // See: https://github.com/ethereumbook/ethereumbook/blob/04f66ae45cd9405cce04a088556144be11979699/06transactions.asciidoc#keeping-track-of-nonces
  // How we'll should keeping track of nonces?
  waitForMessage = async () => {
    const tx = await this.#txPromise;
    await this.#provider.waitForTransaction(tx.hash);
  };
}

class ContractSubscription extends Subscription {
  #contract;
  #provider;
  #eventNames;

  // Why eventNames shoud be passed here?
  constructor(contract, provider, eventNames) {
    eventNames.forEach(eventName => {
      if (contract.interface.events[eventName] === undefined)
        throw new Error(`Event '${eventName}' not found.`);
    });

    super(contract);
    this.#contract = contract;
    this.#provider = provider;
    this.#eventNames = eventNames;
  }

  on = (eventName, listener) => {
    if (!this.#eventNames.includes(eventName) && eventName !== "error") {
      throw new Error(
        `This subscription isn't subscribed on '${eventName}' event.`
      );
    }

    if (eventName === "error") {
      this.addErrorListener(listener);
      return;
    }

    const wrappedListener = async (...args) => {
      const event = args.pop();
      const message = {
        data: {
          args: event.args,
        },
      };

      try {
        await listener(message);
      } catch (error) {
        this.emitErrorEvent(
          new Error(`Callback function with error: ${error.message}`)
        );
      }
    };

    this.addListener(eventName, eventName, listener, wrappedListener);
  };
}

export class Contract {
  #provider;
  #contract;

  constructor(address, abi, wallet) {
    this.#provider = this.#getDefaultProvider();
    this.#initializeContract(address, abi, wallet);
  }

  // Note: For now, `tasit-account` creates a ethers.js wallet object
  // In future, maybe this method could be renamed to setAccount()
  setWallet = wallet => {
    if (!Utils.isEthersJsSigner(wallet))
      throw new Error(`Cannot set an invalid wallet to a Contract`);

    this.#initializeContract(
      this.#contract.address,
      this.#contract.interface.abi,
      wallet
    );
  };

  removeWallet = () => {
    this.#initializeContract(
      this.#contract.address,
      this.#contract.interface.abi
    );
  };

  getAddress = () => {
    return this.#contract.address;
  };

  // For testing purposes
  getProvider = () => {
    return this.#provider;
  };

  subscribe = eventNames => {
    const subscription = new ContractSubscription(
      this.#contract,
      this.#provider,
      eventNames
    );
    return subscription;
  };

  // Notes:
  // - Ethers.js localhost JsonRpcProvider will only be used for testing purpose;
  // - Default provider should be customized (.env file).
  #getDefaultProvider = () => {
    const provider = new ethers.providers.JsonRpcProvider();
    provider.pollingInterval = 50;
    return provider;
  };

  #initializeContract = (address, abi, wallet) => {
    if (!Utils.isAddress(address) || !Utils.isABI(abi))
      throw new Error(`Cannot create a Contract without a address and ABI`);

    if (wallet && !Utils.isEthersJsSigner(wallet))
      throw new Error(`Cannot set an invalid wallet to a Contract`);

    // If there's a wallet, connect it with provider otherwise uses provider directly (for read operations only)
    const signerOrProvider = wallet
      ? wallet.connect(this.#provider)
      : this.#provider;

    this.#contract = new ethers.Contract(address, abi, signerOrProvider);
    this.#addFunctionsToContract();
  };

  #addFunctionsToContract = () => {
    this.#contract.interface.abi
      .filter(json => {
        return json.type === "function";
      })
      .forEach(f => {
        var isWrite = f.stateMutability !== "view";
        if (isWrite) this.#attachWriteFunction(f);
        else {
          this.#attachReadFunction(f);
        }
      });
  };

  #attachReadFunction = f => {
    this[f.name] = async (...args) => {
      const value = await this.#contract[f.name].apply(null, args);
      return value;
    };
  };

  #attachWriteFunction = f => {
    this[f.name] = (...args) => {
      if (!Utils.isEthersJsSigner(this.#contract.signer))
        throw new Error(`Cannot write data to a Contract without a wallet`);

      const tx = this.#contract[f.name].apply(null, args);
      const subscription = new TransactionSubscription(tx, this.#provider);
      return subscription;
    };
  };
}

export const TasitAction = {
  Contract,
};

export default TasitAction;
