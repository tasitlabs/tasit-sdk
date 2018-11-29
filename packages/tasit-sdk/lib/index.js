"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.create = void 0;

require("ethers/dist/shims.js");

var _wallet = require("ethers/wallet");

const create = async () => {
  try {
    const wallet = _wallet.Wallet.createRandom();

    return wallet;
  } catch (error) {
    throw new Error(`Error creating wallet: ${error.message}`);
  }
};

exports.create = create;
const Account = {
  create
};
var _default = Account;
exports.default = _default;