import { ethers } from "ethers";

export const createFromPrivateKey = (privKey) => {
  try {
    const wallet = new ethers.Wallet(privKey);
    return wallet;
  } catch (error) {
    throw new Error(`Error creating account: ${error.message}`);
  }
};

export default { createFromPrivateKey };
