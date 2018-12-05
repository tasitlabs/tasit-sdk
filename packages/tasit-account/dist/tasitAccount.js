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
};

const Account = {
  create
};
exports.Account = Account;
var _default = Account;
exports.default = _default;