import { ethers } from "ethers";

const { utils: ethersUtils, constants: ethersConstants } = ethers;
const { WeiPerEther: WEI_PER_ETHER } = ethersConstants;
export const { bigNumberify } = ethersUtils;

// Note: Also defined in @tasit/action test helpers
// Potential candidate for extracting to test helpers child package.
export const createFromPrivateKey = (privKey) => {
  try {
    const wallet = new ethers.Wallet(privKey);
    return wallet;
  } catch (error) {
    throw new Error(`Error creating account: ${error.message}`);
  }
};

// In weis
// Note: ethers uses BigNumber internally
// That accepts decimal strings (Ref: https://docs.ethers.io/ethers.js/html/api-utils.html#creating-instances)
// Scientific notation works if the number is small enough (< 1e21) to be converted to string properly
// See more: https://github.com/ethers-io/ethers.js/issues/228
const ZERO = 0;
const TOKEN_SUBDIVISIONS = WEI_PER_ETHER;
const ONE = bigNumberify(1).mul(TOKEN_SUBDIVISIONS);
const TWO = bigNumberify(2).mul(TOKEN_SUBDIVISIONS);
const TEN = bigNumberify(10).mul(TOKEN_SUBDIVISIONS);
const ONE_HUNDRED = bigNumberify(100).mul(TOKEN_SUBDIVISIONS);
const ONE_THOUSAND = bigNumberify(1000).mul(TOKEN_SUBDIVISIONS);
const BILLION = bigNumberify(`${1e9}`).mul(TOKEN_SUBDIVISIONS);

// Note: Also defined in @tasit/action test helpers
// Potential candidate for extracting to test helpers child package.
export const constants = {
  ZERO,
  ONE,
  TWO,
  TEN,
  ONE_HUNDRED,
  ONE_THOUSAND,
  BILLION,
  WEI_PER_ETHER,
  TOKEN_SUBDIVISIONS,
};

// Note: These private keys correspond to the the seed phrase
// used for local ganache-cli development
// Note that a different seed phrase / private key was used to deploy
// the Rinkeby testnet contracts originally

const privateKeys = [
  "0x02380f59eeed7a02557aeaab089606739feb0e1db34c6b08374ad31188a3892d",
  "0x2232aa52d058352511c5dd2d0ebcc0cfb6dfb5f051a9b367b7505556d2672490",
  "0x573862e2beaa8dcaf00094c7a56dcb81bcf82c83fc1bb0f9292d6cd656db45df",
  "0xcc51b0d7bb32d222416bfd885498659a9270a1790ba0fcb1771a5fd20507ffa9",
  "0x1fed0a74c3c287f5c93479ff5ba60e1a32974d49425bd6d596ecd0b0f77e0352",
  "0x9f071322c7c55e5d8b7e9778788e798384371c5ec716c60614dd7db009947e18",
  "0xa6d4b9724775bbc5541158ad69e6428af60e5f2251d0bf8fd3e8ab7efa12ee93",
  "0xe1ba62dfb842495d59579dfca29e212ceb78818af7c5869623317fc46dd1a5bf",
  "0xda1a8c477afeb99ae2c2300b22ad612ccf4c184564e332ae9a32f784bbca8d6b",
  "0x633a290bcdabb9075c5a4b3885c69ce64b4b0e6079eb929abb2ac9427c49733b",
];

// Note: Also defined in @tasit/action test helpers
// Potential candidate for extracting to test helpers child package.
export const accounts = privateKeys.map(createFromPrivateKey);

export default { createFromPrivateKey, accounts, constants };
