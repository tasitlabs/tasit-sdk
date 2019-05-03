import { expect } from "chai";
import { ethers } from "ethers";
import ConfigLoader from "../ConfigLoader";
import ProviderFactory from "../ProviderFactory";
import developmentConfig from "../config/default";

// Note:  Using dist file because babel doesn't compile node_modules files.
// Any changes on src should be followed by compilation to avoid unexpected behaviors.
// Note that lerna bootstrap does this for you since it
// runs prepare in all bootstrapped packages.
// Refs: https://github.com/lerna/lerna/tree/master/commands/bootstrap
import { createFromPrivateKey } from "tasit-account/dist/testHelpers/helpers";

const { utils: ethersUtils, constants: ethersConstants } = ethers;
const { WeiPerEther: WEI_PER_ETHER } = ethersConstants;
const { bigNumberify } = ethersUtils;

// In weis
// Note: ethers.js uses BigNumber internally
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
export const accounts = privateKeys.map(createFromPrivateKey);

export const waitForEthersEvent = async (eventEmitter, eventName, callback) => {
  return new Promise((resolve, reject) => {
    const config = ConfigLoader.getConfig();
    const { events } = config;
    const { timeout: EVENT_TIMEOUT } = events;

    const timeout = setTimeout(() => {
      reject(new Error("timeout"));
    }, EVENT_TIMEOUT);

    eventEmitter.on(eventName, (...args) => {
      const event = args.pop();
      callback(event);
      clearTimeout(timeout);
      resolve();
    });
  });
};

const mineOneBlock = async provider => {
  await provider.send("evm_increaseTime", [1]);
  await provider.send("evm_mine", []);
};

export const mineBlocks = async (provider, n) => {
  // Do nothing if provider isn't a JSON-RPC
  // (Infura uses RPC calls over HTTP as opposed to JSON-RPC directly)
  if (!provider.send) return;

  for (let i = 0; i < n; i++) {
    await mineOneBlock(provider);

    // Forcing blocktime > pollingInterval
    // Without that some undesired behavior occurs
    // E.g.: Same listener receiving tx confirmation several times
    // See more: https://github.com/ethers-io/ethers.js/issues/393
    await wait(provider.pollingInterval * 2);
  }
};

export const createSnapshot = async provider => {
  // Do nothing if provider isn't a JSON-RPC
  if (!provider.send) return 1;
  const id = await provider.send("evm_snapshot", []);
  return Number(id);
};

export const revertFromSnapshot = async (provider, snapshotId) => {
  // Do nothing if provider isn't a JSON-RPC
  if (!provider.send) return true;
  return await provider.send("evm_revert", [snapshotId]);
};

export const wait = async ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const expectExactEtherBalances = async (
  provider,
  addresses,
  balances
) => {
  expect(addresses.length).to.equal(balances.length);
  let index = 0;
  for (let address of addresses) {
    const balance = await provider.getBalance(address);
    const expectedBalance = balances[index++];
    expect(balance.toString()).to.equal(expectedBalance.toString());
  }
};

export const expectMinimumEtherBalances = async (
  provider,
  addresses,
  balances
) => {
  expect(addresses.length).to.equal(balances.length);
  let index = 0;
  for (let address of addresses) {
    const balance = await provider.getBalance(address);
    const actual = bigNumberify(balance);
    const expected = bigNumberify(balances[index++]);
    expect(actual.gte(expected), `${actual} isn't >= ${expected}`).to.be.true;
  }
};

export const expectMinimumTokenBalances = async (
  token,
  addresses,
  balances
) => {
  expect(addresses.length).to.equal(balances.length);
  let index = 0;
  for (let address of addresses) {
    const balance = await token.balanceOf(address);
    const actual = bigNumberify(balance);
    const expected = bigNumberify(balances[index++]);
    expect(actual.gte(expected), `${actual} isn't >= ${expected}`).to.be.true;
  }
};

export const expectExactTokenBalances = async (token, addresses, balances) => {
  expect(addresses.length).to.equal(balances.length);
  let index = 0;
  for (let address of addresses) {
    const balance = await token.balanceOf(address);
    const expectedBalance = balances[index++];
    expect(balance.toString()).to.equal(expectedBalance.toString());
  }
};

// TODO: Doing it using Account/Action in future
// See more: https://github.com/tasitlabs/TasitSDK/issues/220
export const etherFaucet = async (
  provider,
  fromWallet,
  beneficiaryAddress,
  amountInWei
) => {
  const connectedFromWallet = fromWallet.connect(provider);
  const tx = await connectedFromWallet.sendTransaction({
    value: amountInWei,
    to: beneficiaryAddress,
  });
  await provider.waitForTransaction(tx.hash);
};

export const erc20Faucet = async (
  tokenContract,
  ownerWallet,
  toAddress,
  amountInWei
) => {
  tokenContract.setWallet(ownerWallet);
  const mintAction = tokenContract.mint(toAddress, `${amountInWei}`);
  await mintAction.send();
  await mintAction.waitForOneConfirmation();
};

const erc721Faucet = async (tokenContract, ownerWallet, toAddress, tokenId) => {
  tokenContract.setWallet(ownerWallet);
  const mintAction = tokenContract.mint(toAddress, tokenId);
  await mintAction.send();
  await mintAction.waitForOneConfirmation();
};

export const addressesAreEqual = (address1, address2) => {
  return address1.toUpperCase() === address2.toUpperCase();
};

export const helpers = {
  waitForEthersEvent,
  mineBlocks,
  createSnapshot,
  revertFromSnapshot,
  wait,
  expectExactEtherBalances,
  expectMinimumEtherBalances,
  expectMinimumTokenBalances,
  expectExactTokenBalances,
  etherFaucet,
  erc20Faucet,
  erc721Faucet,
  addressesAreEqual,
  constants,
  bigNumberify,
  ProviderFactory,
  accounts,
  developmentConfig,
};

export default helpers;
