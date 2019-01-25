import Subscription from "./Subscription";

class ContractEventsSubscription extends Subscription {
  #ethersContract;
  #contract;

  // Note: We're considering listening multiple events at once
  //    adding eventName, listener params to constructor.
  constructor(ethersContract, contract) {
    super(ethersContract);
    this.#ethersContract = ethersContract;
    this.#contract = contract;
  }

  // TODO: Make protected
  _emitErrorEvent(error, eventName) {
    super._emitErrorEvent(error, eventName);
    this.#contract._emitErrorEvent(error, eventName);
  }

  // TODO: Make protected
  _emitErrorEventFromEventListener(error, eventName) {
    super._emitErrorEventFromEventListener(error, eventName);
    this.#contract._emitErrorEventFromEventListener(error, eventName);
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
}

export default ContractEventsSubscription;
