"use strict";

import { Wallet } from "ethers/wallet";

const create = async () => {
  try {
    const wallet = Wallet.createRandom();
    return wallet;
  } catch (error) {
    throw new Error(`Error creating wallet: ${error.message}`);
  }
};

export const Account = {
  create
};

const Tasit = {
	Account
};

export default Tasit;
