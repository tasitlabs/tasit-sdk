import "ethers/dist/shims.js";
// Note: ethers SHOULD be imported from their main object
// shims aren't injected with package import
import { ethers } from "ethers";
const config = require("config");
const PROVIDER_CONFIG = config.provider;
const EVENTS_CONFIG = config.events;

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
  #emitter;
  #events = [];
  #timeout = EVENTS_CONFIG.timeout;

  constructor(eventEmitter) {
    this.#emitter = eventEmitter;
  }

  getTimeout() {
    return this.#timeout;
  }

  setTimeout(timeout) {
    this.#timeout = timeout;
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

  // TODO: Make private/protected
  emitErrorEvent = error => {
    this.#events.forEach(event => {
      if (event.eventName === "error") {
        event.listener(error);
      }
    });
  };

  // TODO: Make private/protected
  addErrorListener = listener => {
    const eventName = "error";
    this.#events.push({
      eventName,
      wrappedEventName: eventName,
      listener,
      wrappedListener: listener,
    });
  };

  getEventInfo = (wrappedEventName, wrappedListener) => {
    return this.#events.find(
      event =>
        event.wrappedEventName === wrappedEventName &&
        event.wrappedListener === wrappedListener
    ).info;
  };

  setEventInfo = (wrappedEventName, wrappedListener, info) => {
    this.#events.forEach(event => {
      if (
        event.wrappedEventName === wrappedEventName &&
        event.wrappedListener === wrappedListener
      )
        event.info = info;
    });
  };

  // TODO: Make private/protected
  addListener = (
    eventName,
    wrappedEventName,
    listener,
    wrappedListener,
    extra
  ) => {
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
    }, this.getTimeout());
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

    let wrappedListener = async blockNumber => {
      try {
        const receipt = await this.#provider.getTransactionReceipt(
          this.#tx.hash
        );
        const txConfirmed = receipt !== null;

        if (txConfirmed) {
          this.setEventInfo("block", wrappedListener, {
            hasBeenConfirmed: true,
          });
        } else {
          const { hasBeenConfirmed } = this.getEventInfo(
            "block",
            wrappedListener
          );
          if (hasBeenConfirmed)
            this.emitErrorEvent(
              new Error(`Your message has been included in an uncle block.`)
            );

          return;
        }

        const { confirmations } = receipt;
        const message = {
          data: {
            confirmations: confirmations,
          },
        };

        await listener(message);
      } catch (error) {
        this.emitErrorEvent(
          new Error(`Callback function with error: ${error.message}`)
        );
      }
    };

    this.addListener(eventName, "block", listener, wrappedListener);
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

class ProviderFactory {
  static getProvider = () => {
    let json;
    try {
      json = PROVIDER_CONFIG;
    } catch (error) {
      console.warn(
        `Error on parsing config.json file, using default configuration.`
      );
      json = ProviderFactory.getDefaultConfig();
    }

    return ProviderFactory.createProvider(json);
  };

  static getDefaultConfig = () => {
    return {
      network: "other",
      provider: "jsonrpc",
      pollingInterval: 50,
      jsonRpc: {
        url: "http://localhost:8545",
        user: "",
        password: "",
        allowInsecure: true,
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

    if (network === "mainnet") network = "homestead";
    else if (network === "other") network = undefined;

    switch (provider) {
      case "default":
        return ethers.getDefaultProvider(network);
      case "infura":
        return new ethers.providers.InfuraProvider(
          network,
          infura.apiAccessToken
        );
      case "etherscan":
        return new ethers.providers.EtherscanProvider(
          network,
          ethescan.apiToken
        );
      case "jsonrpc":
        let p = new ethers.providers.JsonRpcProvider(jsonRpc, network);
        if (pollingInterval) p.pollingInterval = pollingInterval;
        return p;
    }
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
