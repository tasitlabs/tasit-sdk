"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Account = void 0;

require("ethers/dist/shims.js");

var _ethers = require("ethers");

// Note: ethers SHOULD be imported from their main object
// shims aren't injected with package import
const create = () => {
  try {
    const wallet = _ethers.ethers.Wallet.createRandom();

    return wallet;
  } catch (error) {
    throw new Error(`Error creating wallet: ${error.message}`);
  }
}; // Note: I'm not sure if will have this function here,
// for now it's useful to test funded wallets without interacting with `ethers.js`


const createFromPrivateKey = privKey => {
  try {
    const wallet = new _ethers.ethers.Wallet(privKey);
    return wallet;
  } catch (error) {
    throw new Error(`Error creating wallet: ${error.message}`);
  }
};

const Account = {
  create,
  createFromPrivateKey
};
exports.Account = Account;
var _default = Account;
exports.default = _default;