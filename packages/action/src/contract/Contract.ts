import "ethers/dist/shims.js";
// Note: ethers SHOULD be imported from their main object
// shims aren't injected with package import
import { ethers } from "ethers";
import Utils from "./Utils";
import ProviderFactory from "../ProviderFactory";
import Subscription from "../subscription/Subscription";
import Action from "../action/Action";

// Log levels: debug, default, info, warn, error, off
// See more: https://github.com/ethers-io/ethers.js/blob/527de7ba5e1d31bd7c166a78d0fa62b58bf50a54/src.ts/errors.ts
ethers.errors.setLogLevel("error");

interface Wallet {
  connect: (arg0: any) => any;
  _ethersType: string;
}

interface ContractFunction {
  constant: boolean | undefined;
  stateMutability: string;
  name: string | number;
}

export class Contract extends Subscription {
  private provider: any;
  private ethersContract: {
    [x: string]: (arg0: any) => void;
    signer: any;
    address?: any;
    interface?: any;
  };

  // TODO: START HERE NEXT - confirm this is just ignoring TS2376 and only
  // on the next line
  // @ts-ignore: semantic error TS2376: A 'super' call must be the first statement in the constructor when a class contains initialized properties or has parameter properties.

  constructor(address: string, abi: string, wallet: Wallet | undefined) {
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
    this.provider = provider;
    this.ethersContract = ethersContract;
    this.addFunctionsToContract();
  }

  // Note: For now, `tasit-account` creates a ethers wallet object
  setAccount = (wallet: Wallet) => {
    if (!Utils.isEthersJsSigner(wallet))
      throw new Error(`Cannot set an invalid account for a Contract`);

    this.ethersContract = new ethers.Contract(
      this.ethersContract.address,
      this.ethersContract.interface.abi,
      wallet.connect(this.provider)
    );

    this.addFunctionsToContract();
  };

  getAccount = () => {
    const { signer: wallet } = this.ethersContract;
    return wallet;
  };

  removeAccount = () => {
    this.ethersContract = new ethers.Contract(
      this.ethersContract.address,
      this.ethersContract.interface.abi,
      this.provider
    );
    this.addFunctionsToContract();
  };

  getAddress = () => {
    return this.ethersContract.address;
  };

  getABI = () => {
    return this.ethersContract.interface.abi;
  };

  // For testing purposes
  _getProvider = () => {
    return this.provider;
  };

  on = (eventName: any, listener: any) => {
    this.addListener(eventName, listener, false);
  };

  once = (eventName: any, listener: any) => {
    this.addListener(eventName, listener, true);
  };

  private addListener = (
    eventName: string,
    listener: (arg0: any) => void,
    once: any
  ) => {
    if (!this.isEventValid(eventName))
      throw new Error(`Event '${eventName}' not found.`);

    if (eventName === "error" && once)
      throw new Error(`Use on() function to subscribe to an error event.`);

    if (eventName === "error") {
      this._addErrorListener(listener);
    } else {
      this.addContractEventListener(eventName, listener, once);
    }
  };

  private addContractEventListener = (
    eventName: string,
    listener: (arg0: { data: { args: any } }) => void,
    once: any
  ) => {
    const ethersListener = async (...args: any[]) => {
      try {
        // Note: This depends on the current ethers specification of ethersContract events to work:
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

        // Note: Unsubscribing should be done only if the user's listener function will be called
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

  private isEventValid = (eventName: string) => {
    return (
      eventName === "error" ||
      this.ethersContract.interface.events[eventName] !== undefined
    );
  };

  private addFunctionsToContract = () => {
    this.ethersContract.interface.abi
      .filter((json: { type: string }) => {
        return json.type === "function";
      })
      .forEach((f: ContractFunction) => {
        var isWrite =
          (f.constant === undefined &&
            f.stateMutability !== "view" &&
            f.stateMutability !== "pure") ||
          (f.constant !== undefined && f.constant === false);
        if (isWrite) this.attachWriteFunction(f);
        else {
          this.attachReadFunction(f);
        }
      });
  };

  private attachReadFunction = (f: ContractFunction) => {
    this[f.name] = async (arg0: any) => {
      const value = await this.ethersContract[f.name](arg0);
      return value;
    };
  };

  private attachWriteFunction = (f: ContractFunction) => {
    this[f.name] = (...args: any) => {
      if (!Utils.isEthersJsSigner(this.ethersContract.signer))
        throw new Error(`Cannot write data to a Contract without a wallet`);

      const { signer, address } = this.ethersContract;
      const data = this.ethersContract.interface.functions[f.name].encode(args);

      const rawTx = { to: address, data };

      const action = new Action(rawTx, this.provider, signer);

      const errorListener = (error: any) => {
        this._emitErrorEvent(error);
      };

      action.on("error", errorListener);

      return action;
    };
  };
}

export default Contract;
