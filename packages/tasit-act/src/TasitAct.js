import "ethers/dist/shims.js";
// Note: ethers SHOULD be imported from their main object
// shims aren't injected with package import
import { ethers } from "ethers";

// Note:
// This class stills as a PoC
// TODO:
// - Software robustness (try...catch)
class Subscription {
  #txPromise;
  #provider;

  constructor(txPromise, provider) {
    this.#txPromise = txPromise;
    this.#provider = provider;
  }

  on = async (trigger, callback) => {
    let blockHeight = 0;
    if (trigger === "confirmation") blockHeight = 1;

    const tx = await this.#txPromise;

    this.#provider.on(tx.hash, receipt => {
      const message = {
        data: {
          confirmations: receipt.confirmations,
        },
      };

      callback(message);
    });
  };

  removeAllListeners = async () => {
    const tx = await this.#txPromise;
    this.#provider.removeAllListeners(tx.hash);
    console.log("all listeners removed");
  };
}

// Note:
// This class stills as a PoC
// TODO:
// - Software robustness (try...catch)
export class Contract {
  address;
  wallet; // necessarY?
  #provider;
  #contract;

  constructor(address, abi, wallet) {
    this.#provider = this.#getDefaultProvider();

    const signerOrProvider = wallet
      ? wallet.connect(this.#provider)
      : this.#provider;

    this.#contract = new ethers.Contract(address, abi, signerOrProvider);
    this.address = this.#contract.address;
    this.#addFunctionsToContract();
  }

  toEthersJs = () => {
    return this.#contract;
  };

  // Note: For now, `tasit-account` creates a wallet object
  setWallet = wallet => {
    return new Contract(this.address, this.#contract.interface.abi, wallet);
  };

  // Notes:
  // - JsonRpcProvider will only be used for testing purpose;
  // - Default provider should be customized (.env file).
  #getDefaultProvider = () => {
    const provider = new ethers.providers.JsonRpcProvider();
    provider.pollingInterval = 50;
    return provider;
  };

  #addFunctionsToContract = () => {
    this.#contract.interface.abi
      .filter(json => {
        return json.type === "function";
      })
      .forEach(f => {
        var isWrite = !f.constant;
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

  // Check for account before calling write functions
  #attachWriteFunction = f => {
    this[f.name] = (...args) => {
      const tx = this.#contract[f.name].apply(null, args);
      const subscription = new Subscription(tx, this.#provider);
      return subscription;
    };
  };
}

export const TasitAct = {
  Contract,
};

export default TasitAct;
