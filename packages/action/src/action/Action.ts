import Subscription from "../subscription";
import ProviderFactory from "../ProviderFactory";

interface Network {
  chainId: any;
}

interface Receipt {
  confirmations: any;
  status: any;
}

interface RawAction {
  to: any;
  data: any;
}

// If necessary, we can create TransactionAction
// and/or MetaTxAction subclasses
class Action extends Subscription {
  private provider: {
    getTransactionCount: (arg0: any) => void;
    getNetwork: () => Network;
    sendTransaction: (arg0: any) => void;
    getTransactionReceipt: (arg0: any) => Receipt;
    waitForTransaction: (arg0: any) => void;
  };

  private signer: { address: any; sign: (arg0: any) => void };
  private rawAction: any;
  private tx: any;
  private txConfirmations = 0;

  constructor(
    rawAction: RawAction | Promise<RawAction>,
    provider: any,
    signer: any
  ) {
    // Provider implements EventEmitter API and it's enough
    //  to handle with transactions events
    super(provider);

    // Note: As it stands right now, this can be an action OR
    // a promise that resolves with an action
    this.rawAction = rawAction;

    this.signer = signer;
    this.provider = provider;
    this.txConfirmations = 0;
  }

  _toRaw = () => {
    return this.rawAction;
  };

  private fillRawAction = async (rawTx: { value: any }) => {
    const nonce = this.provider.getTransactionCount(this.signer.address);

    const network = this.provider.getNetwork();
    const { chainId } = network;

    let { value } = rawTx;
    value = !value ? 0 : value;

    // Note: Gas estimation should be improved
    // See: https://github.com/tasitlabs/tasit-sdk/issues/173
    //
    // This command isn't working
    const gasPrice = 1e9;
    // Note: Gas estimation should be improved
    // See: https://github.com/tasitlabs/tasit-sdk/issues/173
    //
    // This command isn't working
    //const gasLimit = await this.provider.estimateGas(rawTx);
    const gasLimit = 7e6;

    const rawTxOutput = { ...rawTx, nonce, chainId, value, gasPrice, gasLimit };

    return rawTxOutput;
  };

  private signAndSend = async () => {
    try {
      // Note: Resolving promise if the Action was created using a async rawTx
      const rawAction = await this.rawAction;

      this.rawAction = await this.fillRawAction(rawAction);

      const signedTx = this.signer.sign(this.rawAction);

      this.tx = this.provider.sendTransaction(signedTx);
    } catch (error) {
      this._emitErrorEvent(new Error(`Action with error: ${error.message}`));
    }
  };

  send = async () => {
    await this.signAndSend();
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
    const events = ["confirmation", "error"];

    if (!events.includes(eventName))
      throw new Error(`Invalid event, use: [${events}]`);

    if (eventName === "error" && once)
      throw new Error(`Use on() function to subscribe to an error event.`);

    if (!listener || typeof listener !== "function")
      throw new Error(`Cannot listen without a function`);

    if (eventName !== "error" && eventName !== "confirmation") {
      throw new Error(`Invalid event '${event}'.`);
    } else if (eventName === "error") {
      this._addErrorListener(listener);
    } else if (eventName === "confirmation") {
      this.addConfirmationListener(listener, once);
    }
  };

  private addConfirmationListener = (
    listener: (arg0: { data: { confirmations: any } }) => void,
    once: any
  ) => {
    const eventName = "confirmation";

    const ethersListener = async () => {
      try {
        const tx = await this.tx;
        if (!tx) {
          console.info(`The action wasn't sent yet.`);
          return;
        }

        const receipt = this.provider.getTransactionReceipt(tx.hash);

        const blockReorgOccurred =
          (receipt === null && this.txConfirmations > 0) ||
          (receipt !== null && receipt.confirmations <= this.txConfirmations);

        if (blockReorgOccurred) {
          this._emitErrorEventFromEventListener(
            new Error(
              `Your action's position in the chain has changed in a surprising way.`
            ),
            eventName
          );
        }

        if (!receipt) return;

        const { confirmations, status } = receipt;
        const txFailed = status === 0;

        if (txFailed) {
          this._emitErrorEventFromEventListener(
            new Error(`Action failed.`),
            eventName
          );
          return;
        }

        this.txConfirmations = confirmations;

        const message = {
          data: {
            confirmations,
          },
        };

        // Note: Unsubscribing should be done after the user's listener function is called
        listener(message);
        if (once) this.off(eventName);
      } catch (error) {
        this._emitErrorEventFromEventListener(
          new Error(`Listener function with error: ${error.message}`),
          eventName
        );
      }
    };

    this._addEventListener(eventName, ethersListener);
  };

  getTransaction = () => {
    return this.tx;
  };

  // Note: ActionId is the same as TransactionHash
  getId = async () => {
    const tx = await this.tx;
    const { hash: id } = tx;
    return id;
  };

  // Tech debt
  // This method avoids duplicated nonce generation when several transactions happen in rapid succession
  // See: https://github.com/ethereumbook/ethereumbook/blob/04f66ae45cd9405cce04a088556144be11979699/06transactions.asciidoc#keeping-track-of-nonces
  // How should we keep track of nonces?
  waitForOneConfirmation = async () => {
    const tx = await this.tx;
    if (tx) this.provider.waitForTransaction(tx.hash);
  };

  // For testing purposes
  _refreshProvider = () => {
    this.provider = ProviderFactory.getProvider();
  };
}

export default Action;
