"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Account = void 0;

require("ethers/dist/shims.js");

var _ethers = require("ethers");

// Note: ethers SHOULD be imported from their main Object
// shims are not injected with package import
// import { Wallet } from "ethers/Wallet";
const create = async () => {
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
const Tasit = {
  Account
};
var _default = Tasit;
exports.default = _default;