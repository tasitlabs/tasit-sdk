import "ethers/dist/shims.js";
// Note: ethers SHOULD be imported from their main object
// shims aren't injected with package import
import { ethers } from "ethers";
const config = require("config");
import Utils from "./Utils";
import ProviderFactory from "./ProviderFactory";
import ContractSubscription from "./ContractSubscription";
import TransactionSubscription from "./TransactionSubscription";

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

export default Contract;
