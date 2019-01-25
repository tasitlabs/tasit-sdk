import "ethers/dist/shims.js";
// Note: ethers SHOULD be imported from their main object
// shims aren't injected with package import
import { ethers } from "ethers";
const config = require("config");
import Utils from "./Utils";
import ProviderFactory from "./ProviderFactory";
import ContractEventsSubscription from "./ContractEventsSubscription";
import TransactionSubscription from "./TransactionSubscription";
import Subscription from "./Subscription";

// I'm not sure if extend Subscription is the best approach
// I'm usually think inheritance as an IS-A relationship
// I'm not really sure if "Contract is a Subscription" sounds good
export class Contract extends Subscription {
  #provider;
  #ethersContract;
  #subscription;

  constructor(address, abi, wallet) {
    const provider = ProviderFactory.getProvider();

    super(provider);

    this.#provider = provider;
    this.#initializeContract(address, abi, wallet);
  }

  on = (eventName, listener) => {
    const events = ["error"];

    if (!events.includes(eventName))
      throw new Error(`Invalid event, use: [${events}]`);

    // Note: In the future we'll possibly support more events than just "error"
    if (eventName !== "error") {
      throw new Error(`Invalid event '${event}'.`);
    } else {
      this._addErrorListener(listener);
    }
  };

  // Note: For now, `tasit-account` creates a ethers.js wallet object
  // If that changes, maybe this method could be renamed to setAccount()
  setWallet = wallet => {
    if (!Utils.isEthersJsSigner(wallet))
      throw new Error(`Cannot set an invalid wallet for a Contract`);

    this.#initializeContract(
      this.#ethersContract.address,
      this.#ethersContract.interface.abi,
      wallet
    );
  };

  removeWallet = () => {
    this.#initializeContract(
      this.#ethersContract.address,
      this.#ethersContract.interface.abi
    );
  };

  getAddress = () => {
    return this.#ethersContract.address;
  };

  // For testing purposes
  _getProvider = () => {
    return this.#provider;
  };

  subscribe = () => {
    if (!this.#subscription)
      this.#subscription = new ContractEventsSubscription(
        this.#ethersContract,
        this
      );
    return this.#subscription;
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

    this.#ethersContract = new ethers.Contract(address, abi, signerOrProvider);
    this.#addFunctionsToContract();
  };

  #addFunctionsToContract = () => {
    this.#ethersContract.interface.abi
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
      const value = await this.#ethersContract[f.name].apply(null, args);
      return value;
    };
  };

  #attachWriteFunction = f => {
    this[f.name] = (...args) => {
      if (!Utils.isEthersJsSigner(this.#ethersContract.signer))
        throw new Error(`Cannot write data to a Contract without a wallet`);

      const tx = this.#ethersContract[f.name].apply(null, args);

      const subscription = new TransactionSubscription(
        tx,
        this.#provider,
        this
      );
      return subscription;
    };
  };
}

export default Contract;
