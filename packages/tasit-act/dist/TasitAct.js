"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.TasitAct = exports.Contract = void 0;

require("ethers/dist/shims.js");

var _ethers = require("ethers");

function _classPrivateFieldGet(receiver, privateMap) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return privateMap.get(receiver).value; }

function _classPrivateFieldSet(receiver, privateMap, value) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to set private field on non-instance"); } var descriptor = privateMap.get(receiver); if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; return value; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Utils {}

_defineProperty(Utils, "isAddress", address => {
  return typeof address === "string" && address.match(/^0x[0-9A-Fa-f]{40}$/);
});

_defineProperty(Utils, "isABI", abi => {
  return abi && Array.isArray(abi);
});

_defineProperty(Utils, "isEthersJsSigner", signer => {
  return signer && signer._ethersType === "Signer";
});

class Subscription {
  constructor(_txPromise2, _provider2) {
    _txPromise.set(this, {
      writable: true,
      value: void 0
    });

    _provider.set(this, {
      writable: true,
      value: void 0
    });

    _defineProperty(this, "on", async (trigger, callback) => {
      let blockHeight = 0;
      if (trigger === "confirmation") blockHeight = 1;
      const tx = await _classPrivateFieldGet(this, _txPromise);

      _classPrivateFieldGet(this, _provider).on(tx.hash, async receipt => {
        const message = {
          data: {
            confirmations: receipt.confirmations
          }
        };

        try {
          await callback(message);
        } catch (error) {
          // UnhandledPromiseRejectionWarning
          throw new Error(`Callback function with error: ${error.message}`);
        }
      });
    });

    _defineProperty(this, "removeAllListeners", async () => {
      const tx = await _classPrivateFieldGet(this, _txPromise);

      _classPrivateFieldGet(this, _provider).removeAllListeners(tx.hash);
    });

    _classPrivateFieldSet(this, _txPromise, _txPromise2);

    _classPrivateFieldSet(this, _provider, _provider2);
  }

}

var _txPromise = new WeakMap();

var _provider = new WeakMap();

class Contract {
  constructor(address, abi, _wallet) {
    _defineProperty(this, "address", void 0);

    _provider3.set(this, {
      writable: true,
      value: void 0
    });

    _contract.set(this, {
      writable: true,
      value: void 0
    });

    _defineProperty(this, "setWallet", wallet => {
      if (!Utils.isEthersJsSigner(wallet)) throw new Error(`Cannot set a invalid wallet to a Contract`);
      return new Contract(this.address, _classPrivateFieldGet(this, _contract).interface.abi, wallet);
    });

    _defineProperty(this, "getProvider", () => {
      return _classPrivateFieldGet(this, _provider3);
    });

    _getDefaultProvider.set(this, {
      writable: true,
      value: () => {
        const provider = new _ethers.ethers.providers.JsonRpcProvider();
        provider.pollingInterval = 50;
        return provider;
      }
    });

    _addFunctionsToContract.set(this, {
      writable: true,
      value: () => {
        _classPrivateFieldGet(this, _contract).interface.abi.filter(json => {
          return json.type === "function";
        }).forEach(f => {
          var isWrite = !f.constant;
          if (isWrite) _classPrivateFieldGet(this, _attachWriteFunction).call(this, f);else {
            _classPrivateFieldGet(this, _attachReadFunction).call(this, f);
          }
        });
      }
    });

    _attachReadFunction.set(this, {
      writable: true,
      value: f => {
        this[f.name] = async (...args) => {
          const value = await _classPrivateFieldGet(this, _contract)[f.name].apply(null, args);
          return value;
        };
      }
    });

    _attachWriteFunction.set(this, {
      writable: true,
      value: f => {
        this[f.name] = (...args) => {
          if (!Utils.isEthersJsSigner(_classPrivateFieldGet(this, _contract).signer)) throw new Error(`Cannot setting data to Contract without a wallet`);

          const tx = _classPrivateFieldGet(this, _contract)[f.name].apply(null, args);

          const subscription = new Subscription(tx, _classPrivateFieldGet(this, _provider3));
          return subscription;
        };
      }
    });

    if (!Utils.isAddress(address) || !Utils.isABI(abi)) throw new Error(`Cannot create a Contract without a address and ABI`);

    _classPrivateFieldSet(this, _provider3, _classPrivateFieldGet(this, _getDefaultProvider).call(this));

    const signerOrProvider = _wallet ? _wallet.connect(_classPrivateFieldGet(this, _provider3)) : _classPrivateFieldGet(this, _provider3);

    _classPrivateFieldSet(this, _contract, new _ethers.ethers.Contract(address, abi, signerOrProvider));

    this.address = _classPrivateFieldGet(this, _contract).address;

    _classPrivateFieldGet(this, _addFunctionsToContract).call(this);
  } // Note: For now, `tasit-account` creates a wallet object


}

exports.Contract = Contract;

var _provider3 = new WeakMap();

var _contract = new WeakMap();

var _getDefaultProvider = new WeakMap();

var _addFunctionsToContract = new WeakMap();

var _attachReadFunction = new WeakMap();

var _attachWriteFunction = new WeakMap();

const TasitAct = {
  Contract
};
exports.TasitAct = TasitAct;
var _default = TasitAct;
exports.default = _default;