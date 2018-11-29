"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Account = void 0;

var _wallet = require("ethers/wallet");

const create = async () => {
  try {
    const wallet = _wallet.Wallet.createRandom();

    return wallet;
  } catch (error) {
    throw new Error(`Error creating wallet: ${error.message}`);
  }
};

const Account = {
  create
};
exports.Account = Account;
const Tasit = {
  Account
};
var _default = Tasit;
exports.default = _default;