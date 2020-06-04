import "ethers/dist/shims.js";
// Note: ethers SHOULD be imported from their main object
// shims aren't injected with package import
import { ethers } from "ethers";

// Account creates an ethers Wallet, should it create an Account object that encapsulates the wallet?
// TasitAcount.create()
// > Acount { wallet: ..., metaTxInfos..., etc }
// Related to: https://github.com/tasitlabs/tasit-sdk/issues/220
const create = () => {
  try {
    const wallet = ethers.Wallet.createRandom();
    return wallet;
  } catch (error) {
    throw new Error(`Error creating account: ${error.message}`);
  }
};

export const Account = {
  create,
};

export default Account;
