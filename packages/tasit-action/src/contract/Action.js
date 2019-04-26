import Subscription from "./Subscription";
import ProviderFactory from "../ProviderFactory";
import ConfigLoader from "../ConfigLoader";

// If necessary, we can create TransactionAction
//  and/or MetaTxAction subclasses
export class Action extends Subscription {
  #provider;
  #tx;
  #txConfirmations;
  #timeout;
  #lastConfirmationTime;

  constructor(txPromise, provider) {
    // Provider implements EventEmitter API and it's enough
    //  to handle with transactions events
    super(provider);

    const { events } = ConfigLoader.getConfig();
    const { timeout } = events;

    this.#tx = txPromise.then(
      tx => {
        return tx;
      },
      error => {
        this._emitErrorEvent(new Error(`Action with error: ${error.message}`));
      }
    );

    this.#timeout = timeout;
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
      this.#addConfirmationListener(listener, once);
    }
  };

  #addConfirmationListener = (listener, once) => {
    const eventName = "confirmation";

    const baseEthersListener = async blockNumber => {
      try {
        const tx = await this.#tx;

        const receipt = await this.#provider.getTransactionReceipt(tx.hash);

        const blockReorgOccurred =
          (receipt === null && this.#txConfirmations > 0) ||
          (receipt !== null && receipt.confirmations <= this.#txConfirmations);

        if (blockReorgOccurred) {
          this._emitErrorEventFromEventListener(
            new Error(
              `Your action's position in the chain has changed in a surprising way.`
            ),
            eventName
          );
        }

        if (receipt === null) {
          this.#txConfirmations = 0;
          return;
        }

        const txFailed = receipt.status == 0;
        if (txFailed) {
          this._emitErrorEventFromEventListener(
            new Error(`Action failed.`),
            eventName
          );
          return;
        }

        this._clearEventTimerIfExists(eventName);

        this.#lastConfirmationTime = Date.now();

        const timer = setTimeout(() => {
          const currentTime = Date.now();
          const timedOut =
            currentTime - this.#lastConfirmationTime >= this.getEventsTimeout();

          if (timedOut) {
            this._emitErrorEventFromEventListener(
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
        this._emitErrorEventFromEventListener(
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

  getTransaction = () => {
    return this.#tx;
  };

  // Note: ActionId is the same as TransactionHash
  getId = async () => {
    const tx = await this.#tx;
    const { hash: id } = tx;
    return id;
  };

  // Tech debt
  // This method avoids duplicated nonce generation when several transactions happen in rapid succession
  // See: https://github.com/ethereumbook/ethereumbook/blob/04f66ae45cd9405cce04a088556144be11979699/06transactions.asciidoc#keeping-track-of-nonces
  // How should we keep track of nonces?
  waitForOneConfirmation = async () => {
    const tx = await this.#tx;
    if (tx) await this.#provider.waitForTransaction(tx.hash);
  };

  // For testing purposes
  _refreshProvider = () => {
    this.#provider = ProviderFactory.getProvider();
  };
}

export default Action;
