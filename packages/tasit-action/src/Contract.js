import "ethers/dist/shims.js";
// Note: ethers SHOULD be imported from their main object
// shims aren't injected with package import
import { ethers } from "ethers";
import Utils from "./Utils";
import ProviderFactory from "./ProviderFactory";
import Subscription from "./Subscription";
import Action from "./Action";

export class Contract extends Subscription {
  #provider;
  #ethersContract;

  constructor(address, abi, wallet) {
    if (!Utils.isAddress(address) || !Utils.isABI(abi))
      throw new Error(`Cannot create a Contract without a address and ABI`);

    if (wallet && !Utils.isEthersJsSigner(wallet))
      throw new Error(`Cannot set an invalid wallet for a Contract`);

    const provider = ProviderFactory.getProvider();

    // If there's a wallet, connect it with provider.
    // Otherwise use provider directly (for read operations only).
    const signerOrProvider = wallet ? wallet.connect(provider) : provider;

    const ethersContract = new ethers.Contract(address, abi, signerOrProvider);

    super(ethersContract);
    this.#provider = provider;
    this.#ethersContract = ethersContract;
    this.#addFunctionsToContract();
  }

  // Note: For now, `tasit-account` creates a ethers.js wallet object
  // If that changes, maybe this method could be renamed to setAccount()
  setWallet = wallet => {
    if (!Utils.isEthersJsSigner(wallet))
      throw new Error(`Cannot set an invalid wallet for a Contract`);

    this.#ethersContract = new ethers.Contract(
      this.#ethersContract.address,
      this.#ethersContract.interface.abi,
      wallet.connect(this.#provider)
    );

    this.#addFunctionsToContract();
  };

  removeWallet = () => {
    this.#ethersContract = new ethers.Contract(
      this.#ethersContract.address,
      this.#ethersContract.interface.abi,
      this.#provider
    );
    this.#addFunctionsToContract();
  };

  getAddress = () => {
    return this.#ethersContract.address;
  };

  // For testing purposes
  _getProvider = () => {
    return this.#provider;
  };

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
        // Note: This depends on the current ethers.js specification of ethersContract events to work:
        // "All event callbacks receive the parameters specified in the ABI as well as
        // one additional Event Object"
        // https://docs.ethers.io/ethers.js/html/api-ethersContract.html#event-object
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
        this._emitErrorEventFromEventListener(
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
      this.#ethersContract.interface.events[eventName] !== undefined
    );
  };

  #addFunctionsToContract = () => {
    this.#ethersContract.interface.abi
      .filter(json => {
        return json.type === "function";
      })
      .forEach(f => {
        var isWrite =
          (f.constant === undefined &&
            f.stateMutability !== "view" &&
            f.stateMutability !== "pure") ||
          (f.constant !== undefined && f.constant === false);
        if (isWrite) this.#attachWriteFunction(f);
        else {
          this.#attachReadFunction(f);
        }
      });
  };

  #attachReadFunction = f => {
    this[f.name] = async (...args) => {
      const value = await this.#ethersContract[f.name].apply(null, args);
      return value;
    };
  };

  #attachWriteFunction = f => {
    this[f.name] = (...args) => {
      if (!Utils.isEthersJsSigner(this.#ethersContract.signer))
        throw new Error(`Cannot write data to a Contract without a wallet`);

      const tx = this.#ethersContract[f.name].apply(null, args);

      const action = new Action(tx, this.#provider);

      const errorListener = message => {
        const { error } = message;
        this._emitErrorEvent(new Error(`${error.message}`));
      };

      action.on("error", errorListener);

      return action;
    };
  };
}

export default Contract;
