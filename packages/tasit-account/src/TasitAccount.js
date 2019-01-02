import "ethers/dist/shims.js";
// Note: ethers SHOULD be imported from their main object
// shims aren't injected with package import
import { ethers } from "ethers";

const create = () => {
  try {
    const wallet = ethers.Wallet.createRandom();
    return wallet;
  } catch (error) {
    throw new Error(`Error creating wallet: ${error.message}`);
  }
};

// Note: I'm not sure if will have this function here,
// for now it's useful to test funded wallets without interacting with `ethers.js`
const createFromPrivateKey = privKey => {
  try {
    const wallet = new ethers.Wallet(privKey);
    return wallet;
  } catch (error) {
    throw new Error(`Error creating wallet: ${error.message}`);
  }
};

export const Account = {
  create,
  createFromPrivateKey,
};

export default Account;