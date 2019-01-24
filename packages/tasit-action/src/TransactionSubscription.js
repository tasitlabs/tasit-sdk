import Subscription from "./Subscription";
import ProviderFactory from "./ProviderFactory";
const config = require("config");

// Note: If this class will be used to handle meta-tx too,
//  it should be renamed to ActionSubscription.
export class TransactionSubscription extends Subscription {
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
        if (!this.#tx) this.#tx = await this.#txPromise;

        const receipt = await this.#provider.getTransactionReceipt(
          this.#tx.hash
        );

        const blockReorgOccurred =
          (receipt === null && this.#txConfirmations > 0) ||
          (receipt !== null && receipt.confirmations <= this.#txConfirmations);

        if (blockReorgOccurred) {
          this._emitErrorEvent(
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
    if (!this.#tx) this.#tx = await this.#txPromise;
    if (this.#tx) await this.#provider.waitForTransaction(this.#tx.hash);
  };

  // For testing purposes
  refreshProvider = () => {
    this.#provider = ProviderFactory.getProvider();
  };
}

export default TransactionSubscription;
