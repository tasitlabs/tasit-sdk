"use strict";

require("ethers/dist/shims.js");

let ethers = require("ethers");

const create = async () => {
  try {
    const wallet = ethers.Wallet.createRandom();
    return wallet;
  } catch (error) {
    throw new Error(`Error creating wallet: ${error.message}`);
  }
};

const Account = {
  create
};
const Tasit = {
  Account
};
module.exports = {
  Account
};