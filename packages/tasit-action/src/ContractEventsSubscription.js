import Subscription from "./Subscription";

class ContractEventsSubscription extends Subscription {
  #contract;

  // Note: We're considering listening multiple events at once
  //    adding eventName, listener params to constructor.
  constructor(contract) {
    super(contract);
    this.#contract = contract;
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
        // Note: This depends on the current ethers.js specification of contract events to work:
        // "All event callbacks receive the parameters specified in the ABI as well as
        // one additional Event Object"
        // https://docs.ethers.io/ethers.js/html/api-contract.html#event-object
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
        this._emitErrorEvent(
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
      this.#contract.interface.events[eventName] !== undefined
    );
  };
}

export default ContractEventsSubscription;
