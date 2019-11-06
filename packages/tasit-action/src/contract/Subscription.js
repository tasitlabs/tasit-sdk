import ConfigLoader from "../ConfigLoader";

export class Subscription {
  #ethersEventEmitter;
  #eventListeners = new Map();
  #timeout;

  constructor(eventEmitter) {
    const { events } = ConfigLoader.getConfig();
    const { timeout } = events;

    this.#timeout = timeout;
    this.#ethersEventEmitter = eventEmitter;
  }

  _toEthersEventName = eventName => {
    if (eventName === "confirmation") return "block";
    return eventName;
  };

  off = eventName => {
    const eventListener = this.#eventListeners.get(eventName);

    if (!eventListener) {
      console.warn(`A listener for event '${eventName}' isn't registered.`);
      return;
    }

    if (eventName !== "error") {
      this._clearEventTimerIfExists(eventName);

      this.#ethersEventEmitter.removeAllListeners(
        this._toEthersEventName(eventName)
      );
    }
    this.#eventListeners.delete(eventName);
  };

  getTimeout = () => {
    return this.#timeout;
  };

  setTimeout = timeout => {
    this.#timeout = timeout;
  };

  // TODO: Make protected
  _clearEventTimerIfExists = eventName => {
    const eventListener = this.#eventListeners.get(eventName);

    if (!eventListener) {
      console.warn(`A listener for event '${eventName}' isn't registered.`);
      return;
    }

    const { timer } = eventListener;

    if (!timer) return;

    clearTimeout(timer);
  };

  unsubscribe = () => {
    this.#eventListeners.forEach((eventListener, eventName) => {
      this.off(eventName);
    });
  };

  subscribedEventNames = () => {
    return Array.from(this.#eventListeners.keys());
  };

  // TODO: Make protected
  _emitErrorEvent = error => {
    const errorEventListener = this.#eventListeners.get("error");
    if (!errorEventListener) {
      // Note: Throw error?
      console.warn(`Error emission without listener: ${error}`);
      return;
    }

    errorEventListener.listener(error);
  };

  // TODO: Make protected
  _emitErrorEventFromEventListener = (error, eventName) => {
    error.eventName = eventName;
    this._emitErrorEvent(error);
  };

  // TODO: Make protected
  //
  // Note: Since we allow only one listener per event (error included),
  // If there is a error event already, it will be replaced by new listener function
  // that will call both new and old functions
  _addErrorListener = newListener => {
    const eventName = "error";
    let listener = newListener;
    const oldErrorEventListener = this.#eventListeners.get(eventName);

    if (oldErrorEventListener) {
      listener = error => {
        newListener(error);
        oldErrorEventListener.listener(error);
      };
    }

    this.#eventListeners.set(eventName, {
      listener,
    });
  };

  // TODO: Make protected
  _addEventListener = (eventName, baseListener) => {
    if (eventName === "error")
      throw new Error(
        `Use _addErrorListener function to subscribe to an error event.`
      );

    if (this.subscribedEventNames().includes(eventName))
      throw new Error(
        `A listener for event '${eventName}' is already registered.`
      );

    // Note:
    // On the development env (using ganache-cli)
    // Blocks are being mined simultaneously and generating a sort of unexpected behaviors like:
    // - once listeners called many times
    // - sequential blocks giving same confirmation to a transaction
    // - false-positive reorg event emission
    // - collaborating for tests non-determinism
    //
    // Tech debt:
    // See if there is another way to avoid these problems
    //
    // Question:
    // Is it possible that that behavior (listener concurrent calls for the same event) is desirable?
    const listener = async (...args) => {
      const eventListener = this.#eventListeners.get(eventName);
      const { isRunning } = eventListener;

      if (isRunning) {
        console.info(`Listener is already running`);
        return;
      }

      this.#decorateEventListener(eventName, {
        isRunning: true,
        lastEmissionTime: Date.now(),
      });

      this._clearEventTimerIfExists(eventName);

      const timer = setTimeout(() => {
        const eventListener = this.#eventListeners.get(eventName);
        const { lastEmissionTime } = eventListener;
        const currentTime = Date.now();
        const timedOut = currentTime - lastEmissionTime >= this.getTimeout();

        if (timedOut) {
          this._emitErrorEventFromEventListener(
            new Error(`Event ${eventName} reached timeout.`),
            eventName
          );
        }
      }, this.getTimeout());

      this.#decorateEventListener(eventName, { timer });
      await baseListener(...args);
      this.#decorateEventListener(eventName, { isRunning: false });
    };

    const eventListener = { listener, isRunning: false };

    this.#eventListeners.set(eventName, eventListener);

    this.#ethersEventEmitter.on(this._toEthersEventName(eventName), listener);
  };

  // For testing purposes
  getEmitter = () => {
    return this.#ethersEventEmitter;
  };

  #decorateEventListener = (eventName, newArgs) => {
    let eventListener = this.#eventListeners.get(eventName);

    if (!eventListener) return;

    eventListener = { ...eventListener, ...newArgs };

    this.#eventListeners.set(eventName, eventListener);
  };
}

export default Subscription;
