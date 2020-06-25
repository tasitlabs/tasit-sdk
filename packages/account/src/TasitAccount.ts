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

// In the client app
// import * as Random from 'expo-random';
// const randomBytes = await Random.getRandomBytesAsync(16);
// https://github.com/expo/expo/tree/master/packages/expo-random#getrandombytesasync

const createUsingRandomness = (randomBytes: Uint8Array) => {
  try {
    const mnemonic = ethers.utils.HDNode.entropyToMnemonic(randomBytes);
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    return wallet;
  } catch (error) {
    throw new Error(`Error creating account with randomness: ${error.message}`);
  }
}

// TODO: Potentially make a method called save to persist an account
// with the public address in Async Storage
// https://react-native-community.github.io/async-storage/
// and the private key in Expo SecureStore
// https://docs.expo.io/versions/latest/sdk/securestore/
// But that would go in a package that has hooks and React
// as a peer dep, like @tasit/hooks

export const Account = {
  create,
  createUsingRandomness
};

export default Account;
