import "ethers/dist/shims.js";
// Note: ethers SHOULD be imported from their main object
// shims aren't injected with package import
import { ethers } from "ethers";
const config = require("config");

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
  #ethersEventEmitter;
  #eventListeners = new Map();

  constructor(eventEmitter) {
    this.#ethersEventEmitter = eventEmitter;
  }

  _toEthersEventName = eventName => {
    if (eventName === "confirmation") return "block";
    return eventName;
  };

  off = eventName => {
    const eventListener = this.#eventListeners.get(eventName);

    if (!eventListener) {
      console.warn(`A listener for event '${eventName}' isn't registered.`);
      return;
    }

    if (eventName !== "error") {
      const { listener } = eventListener;

      this._clearEventTimerIfExists(eventName);

      this.#ethersEventEmitter.removeAllListeners(
        this._toEthersEventName(eventName)
      );
    }
    this.#eventListeners.delete(eventName);
  };

  // TODO: Make protected
  _setEventTimer = (eventName, timer) => {
    const eventListener = this.#eventListeners.get(eventName);

    if (!eventListener) {
      console.warn(`A listener for event '${eventName}' isn't registered.`);
      return;
    }

    const { listener } = eventListener;

    this.#eventListeners.set(eventName, { listener, timer });
  };

  // TODO: Make protected
  _clearEventTimerIfExists = eventName => {
    const eventListener = this.#eventListeners.get(eventName);

    if (!eventListener) {
      console.warn(`A listener for event '${eventName}' isn't registered.`);
      return;
    }

    const { timer } = eventListener;

    if (!timer) return;

    clearTimeout(timer);
  };

  unsubscribe = () => {
    this.#eventListeners.forEach((eventListener, eventName) => {
      this.off(eventName);
    });
  };

  subscribedEventNames = () => {
    return Array.from(this.#eventListeners.keys());
  };

  // TODO: Make protected
  _emitErrorEvent = (error, eventName) => {
    const errorEventListener = this.#eventListeners.get("error");
    if (!errorEventListener) {
      // Note: Throw error?
      console.warn(`Error emission without listener: ${error}`);
      return;
    }

    const message = { error, eventName };
    errorEventListener.listener(message);
  };

  // TODO: Make protected
  _addErrorListener = listener => {
    this.#eventListeners.set("error", {
      listener,
    });
  };

  // TODO: Make protected
  _addEventListener = (eventName, listener) => {
    if (eventName === "error")
      throw new Error(
        `Use _addErrorListener function to subscribe to an error event.`
      );

    if (this.subscribedEventNames().includes(eventName))
      throw new Error(
        `A listener for event '${eventName}' is already registered.`
      );

    this.#eventListeners.set(eventName, {
      listener,
    });

    this.#ethersEventEmitter.on(this._toEthersEventName(eventName), listener);
  };

  // For testing purposes
  getEmitter = () => {
    return this.#ethersEventEmitter;
  };
}

class TransactionSubscription extends Subscription {
  #txPromise;
  #provider;
  #tx;
  #txConfirmations;
  #timeout;
  #lastConfirmationTime;

  constructor(txPromise, provider) {
    // Provider implements EventEmitter API and it's enough
    //  to handle with transactions events
    super(provider);

    const { events } = config;
    const { timeout } = events;

    this.#timeout = timeout;
    this.#txPromise = txPromise;
    this.#provider = provider;
    this.#txConfirmations = 0;
  }

  on = (eventName, listener) => {
    this.#addListener(eventName, listener, false);
  };

  once = (eventName, listener) => {
    this.#addListener(eventName, listener, true);
  };

  getEventsTimeout = () => {
    return this.#timeout;
  };

  setEventsTimeout = timeout => {
    this.#timeout = timeout;
  };

  #addListener = (eventName, listener, once) => {
    const triggers = ["confirmation", "error"];

    if (!triggers.includes(eventName))
      throw new Error(`Invalid listener trigger, use: [${triggers}]`);

    if (eventName === "error" && once)
      throw new Error(`Use on() function to subscribe to an error event.`);

    if (!listener || typeof listener !== "function")
      throw new Error(`Cannot listen without a function`);

    if (eventName === "error") {
      this._addErrorListener(listener);
    } else if (eventName === "confirmation") {
      this.#addConfirmationListener(listener, once);
    }
  };

  #addConfirmationListener = (listener, once) => {
    const eventName = "confirmation";

    const baseEthersListener = async blockNumber => {
      try {
        if (!this.#tx) this.#tx = await this.#txPromise;

        const receipt = await this.#provider.getTransactionReceipt(
          this.#tx.hash
        );

        const blockReorgOccurred =
          (receipt === null && this.#txConfirmations > 0) ||
          (receipt !== null && receipt.confirmations <= this.#txConfirmations);

        if (blockReorgOccurred) {
          this._emitErrorEvent(
            new Error(`Your message has been included in an uncle block.`),
            eventName
          );
        }

        if (receipt === null) {
          this.#txConfirmations = 0;
          return;
        }

        this._clearEventTimerIfExists(eventName);

        this.#lastConfirmationTime = Date.now();

        const timer = setTimeout(() => {
          const currentTime = Date.now();
          const timedOut =
            currentTime - this.#lastConfirmationTime >= this.getEventsTimeout();

          if (timedOut) {
            this._emitErrorEvent(
              new Error(`Event ${eventName} reached timeout.`),
              eventName
            );
          }
        }, this.getEventsTimeout());

        this._setEventTimer(eventName, timer);

        const { confirmations } = receipt;

        this.#txConfirmations = confirmations;

        const message = {
          data: {
            confirmations,
          },
        };

        await listener(message);
      } catch (error) {
        this._emitErrorEvent(
          new Error(`Listener function with error: ${error.message}`),
          eventName
        );
      }
    };

    let ethersListener;

    if (once) {
      ethersListener = async blockNumber => {
        await baseEthersListener(blockNumber);
        this.off(eventName);
      };
    } else {
      ethersListener = baseEthersListener;
    }

    this._addEventListener(eventName, ethersListener);
  };

  // Tech debt
  // This method avoids duplicated nonce generation when several transactions happen in rapid succession
  // See: https://github.com/ethereumbook/ethereumbook/blob/04f66ae45cd9405cce04a088556144be11979699/06transactions.asciidoc#keeping-track-of-nonces
  // How should we keep track of nonces?
  waitForNonceToUpdate = async () => {
    const tx = await this.#txPromise;
    await this.#provider.waitForTransaction(tx.hash);
  };

  // For testing purposes
  refreshProvider = () => {
    this.#provider = ProviderFactory.getProvider();
  };
}

class ContractSubscription extends Subscription {
  #contract;

  // Note: We're considering listening multiple events at once
  //    adding eventName, listener params to constructor.
  constructor(contract) {
    super(contract);
    this.#contract = contract;
  }

  on = (eventName, listener) => {
    this.#addListener(eventName, listener, false);
  };

  once = (eventName, listener) => {
    this.#addListener(eventName, listener, true);
  };

  #addListener = (eventName, listener, once) => {
    if (!this.#isEventValid(eventName))
      throw new Error(`Event '${eventName}' not found.`);

    if (eventName === "error" && once)
      throw new Error(`Use on() function to subscribe to an error event.`);

    if (eventName === "error") {
      this._addErrorListener(listener);
    } else {
      this.#addContractEventListener(eventName, listener, once);
    }
  };

  #addContractEventListener = (eventName, listener, once) => {
    const ethersListener = async (...args) => {
      try {
        // Note: This depends on the current ethers.js specification of contract events to work:
        // "All event callbacks receive the parameters specified in the ABI as well as
        // one additional Event Object"
        // https://docs.ethers.io/ethers.js/html/api-contract.html#event-object
        // TODO: Consider checking that the event looks like what we expect and
        // erroring out if not
        const event = args.pop();

        const message = {
          data: {
            args: event.args,
          },
        };

        if (once) this.off(eventName);

        await listener(message);
      } catch (error) {
        this._emitErrorEvent(
          new Error(`Listener function with error: ${error.message}`),
          eventName
        );
      }
    };

    this._addEventListener(eventName, ethersListener);
  };

  #isEventValid = eventName => {
    return (
      eventName === "error" ||
      this.#contract.interface.events[eventName] !== undefined
    );
  };
}

class ProviderFactory {
  static getProvider = () => {
    const { provider } = config;
    const json = provider;
    return ProviderFactory.createProvider(json);
  };

  static getDefaultConfig = () => {
    return {
      network: "mainnet",
      provider: "fallback",
      pollingInterval: 4000,
      jsonRpc: {
        url: "http://localhost",
        port: 8545,
        allowInsecure: false,
      },
    };
  };

  static createProvider = ({
    network,
    provider,
    pollingInterval,
    jsonRpc,
    infura,
    etherscan,
  }) => {
    const networks = ["mainnet", "rinkeby", "ropsten", "kovan", "other"];
    const providers = ["default", "infura", "etherscan", "jsonrpc"];

    if (!networks.includes(network)) {
      throw new Error(`Invalid network, use: [${networks}].`);
    }

    if (!providers.includes(provider)) {
      throw new Error(`Invalid provider, use: [${providers}].`);
    }

    if (provider === "fallback") network = "default";
    if (network === "mainnet") network = "homestead";
    else if (network === "other") network = undefined;

    const defaultConfig = ProviderFactory.getDefaultConfig();

    let ethersProvider;

    switch (provider) {
      case "default":
        ethersProvider = ethers.getDefaultProvider(network);

      case "infura":
        ethersProvider = new ethers.providers.InfuraProvider(
          network,
          infura.apiKey
        );

      case "etherscan":
        ethersProvider = new ethers.providers.EtherscanProvider(
          network,
          etherscan.apiKey
        );

      case "jsonrpc":
        let { url, port, user, password, allowInsecure } = jsonRpc;
        if (url === undefined) url = defaultConfig.jsonRpc.url;
        if (port === undefined) port = defaultConfig.jsonRpc.port;
        if (allowInsecure === undefined)
          allowInsecure = defaultConfig.jsonRpc.allowInsecure;

        ethersProvider = new ethers.providers.JsonRpcProvider(
          { url: `${url}:${port}`, user, password, allowInsecure },
          network
        );
    }

    if (pollingInterval) ethersProvider.pollingInterval = pollingInterval;
    return ethersProvider;
  };
}

export class Contract {
  #provider;
  #contract;

  constructor(address, abi, wallet) {
    this.#provider = ProviderFactory.getProvider();
    this.#initializeContract(address, abi, wallet);
  }

  // Note: For now, `tasit-account` creates a ethers.js wallet object
  // If that changes, maybe this method could be renamed to setAccount()
  setWallet = wallet => {
    if (!Utils.isEthersJsSigner(wallet))
      throw new Error(`Cannot set an invalid wallet for a Contract`);

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

  subscribe = () => {
    const subscription = new ContractSubscription(this.#contract);
    return subscription;
  };

  #initializeContract = (address, abi, wallet) => {
    if (!Utils.isAddress(address) || !Utils.isABI(abi))
      throw new Error(`Cannot create a Contract without a address and ABI`);

    if (wallet && !Utils.isEthersJsSigner(wallet))
      throw new Error(`Cannot set an invalid wallet for a Contract`);

    // If there's a wallet, connect it with provider. Otherwise use provider directly (for read operations only).
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
        var isWrite =
          f.stateMutability !== "view" && f.stateMutability !== "pure";
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
