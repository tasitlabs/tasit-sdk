"use strict";

import { Wallet } from "ethers/wallet";

export const create = async () => {
  try {
    const wallet = Wallet.createRandom();
    return wallet;
  } catch (error) {
    throw new Error(`Error creating wallet: ${error.message}`);
  }
};

const Account = {
  create
};

export default Account;
