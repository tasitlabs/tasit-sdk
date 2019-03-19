import { expect } from "chai";
import { ethers } from "ethers";
import ProviderFactory from "../ProviderFactory";
import developmentConfig from "../config/default";

// Note:  Using dist file because babel doesn't compile node_modules files.
// Any changes on src should be followed by compilation to avoid unexpected behaviors.
// Note that lerna bootstrap does this for you since it
// runs prepare in all bootstrapped packages.
// Refs: https://github.com/lerna/lerna/tree/master/commands/bootstrap
import { createFromPrivateKey } from "tasit-account/dist/testHelpers/helpers";

const {
  utils: ethersUtils,
  constants: ethersConstants,
  Contract: ethersContract,
} = ethers;
const { WeiPerEther } = ethersConstants;
const { bigNumberify } = ethersUtils;

// In weis
// Note: ethers.js uses BigNumber internally
// That accepts decimal strings (Ref: https://docs.ethers.io/ethers.js/html/api-utils.html#creating-instances)
// Scientific notation works if the number is small enough (< 1e21) to be converted to string properly
// See more: https://github.com/ethers-io/ethers.js/issues/228
const ZERO = 0;
const ONE = bigNumberify(1).mul(WeiPerEther);
const TEN = bigNumberify(10).mul(WeiPerEther);
const ONE_HUNDRED = bigNumberify(100).mul(WeiPerEther);
const ONE_THOUSAND = bigNumberify(1000).mul(WeiPerEther);
const BILLION = bigNumberify(`${1e9}`).mul(WeiPerEther);

const constants = {
  ZERO,
  ONE,
  TEN,
  ONE_HUNDRED,
  ONE_THOUSAND,
  BILLION,
  WeiPerEther,
};

// TODO: Go deep on gas handling.
// Without that, VM returns a revert error instead of out of gas error.
// See: https://github.com/tasitlabs/TasitSDK/issues/173
const gasParams = {
  gasLimit: 7e6,
  gasPrice: 1e9,
};

const accounts = [
  createFromPrivateKey(
    "0x11d943d7649fbdeb146dc57bd9cfc80b086bfab2330c7b25651dbaf382392f60"
  ),
  createFromPrivateKey(
    "0xc181b6b02c9757f13f5aa15d1342a58970a8a489722dc0608a1d09fea717c181"
  ),
  createFromPrivateKey(
    "0x4f09311114f0ff4dfad0edaa932a3e01a4ee9f34da2cbd087aa0e6ffcb9eb322"
  ),
  createFromPrivateKey(
    "0xb52de6b5c3b38277edc6a30db517c719af6c7f0d3743a254cb2e0b54408ecbd8"
  ),
  createFromPrivateKey(
    "0x65a6dacaed00c004c4739a121c2c4908d5da41e4015f9f7cf75f8686a019d419"
  ),
  createFromPrivateKey(
    "0x17f6836e922fde89ca95883631f02ff89787ec0ac593106527f9bd2635080fb6"
  ),
  createFromPrivateKey(
    "0xe28dec48b18fb80369ea651cf703a053b2a5cce868e3450b4e532ca0fb8149b4"
  ),
  createFromPrivateKey(
    "0xd79a1249c9ec1b468a71971fe551358ca4d1f9167f085b87f33c1783839c4d9d"
  ),
  createFromPrivateKey(
    "0x8fb382c5caa48ed928e6f6324e3b8112e43e2aaa9a761b12501321630a512b49"
  ),
  createFromPrivateKey(
    "0xee0c6b1a7adea9f87b1a422eb06b245fc714b8eca4c8c0578d6cf946beba86f1"
  ),
];

const waitForEthersEvent = async (eventEmitter, eventName, callback) => {
  return new Promise(function(resolve, reject) {
    eventEmitter.on(eventName, (...args) => {
      const event = args.pop();
      callback(event);
      resolve();
    });
  });
};

const mineOneBlock = async provider => {
  await provider.send("evm_increaseTime", [1]);
  await provider.send("evm_mine", []);
};

const mineBlocks = async (provider, n) => {
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

const createSnapshot = async provider => {
  // Do nothing if provider isn't a JSON-RPC
  if (!provider.send) return 1;
  const id = await provider.send("evm_snapshot", []);
  return Number(id);
};

const revertFromSnapshot = async (provider, snapshotId) => {
  // Do nothing if provider isn't a JSON-RPC
  if (!provider.send) return true;
  return await provider.send("evm_revert", [snapshotId]);
};

const wait = async ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const etherBalancesAreEqual = async (provider, addresses, balances) => {
  expect(addresses.length).to.equal(balances.length);
  let index = 0;
  for (let address of addresses) {
    const balance = await provider.getBalance(address);
    const expectedBalance = balances[index++];
    expect(balance.toString()).to.equal(expectedBalance.toString());
  }
};

const etherBalancesAreAtLeast = async (provider, addresses, balances) => {
  expect(addresses.length).to.equal(balances.length);
  let index = 0;
  for (let address of addresses) {
    const balance = await provider.getBalance(address);
    const actual = bigNumberify(balance);
    const expected = bigNumberify(balances[index++]);
    expect(actual.gte(expected)).to.be.true;
  }
};

const tokenBalancesAreAtLeast = async (token, addresses, balances) => {
  expect(addresses.length).to.equal(balances.length);
  let index = 0;
  for (let address of addresses) {
    const balance = await token.balanceOf(address);
    const actual = bigNumberify(balance);
    const expected = bigNumberify(balances[index++]);
    expect(actual.gte(expected)).to.be.true;
  }
};

const tokenBalancesAreEqual = async (token, addresses, balances) => {
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
const etherFaucet = async (
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

const erc20Faucet = async (
  tokenContract,
  ownerWallet,
  toAddress,
  amountInWei
) => {
  tokenContract.setWallet(ownerWallet);
  const mintAction = tokenContract.mint(toAddress, `${amountInWei}`);
  await mintAction.waitForNonceToUpdate();
  await tokenBalancesAreEqual(tokenContract, [toAddress], [amountInWei]);
};

const erc721Faucet = async (tokenContract, ownerWallet, toAddress, tokenId) => {
  tokenContract.setWallet(ownerWallet);
  const mintAction = tokenContract.mint(toAddress, tokenId);
  await mintAction.waitForNonceToUpdate();
  await tokenBalancesAreEqual(tokenContract, [toAddress], [1]);
};

const addressesAreEqual = (address1, address2) => {
  return address1.toUpperCase() === address2.toUpperCase();
};

export const helpers = {
  waitForEthersEvent,
  mineBlocks,
  createSnapshot,
  revertFromSnapshot,
  wait,
  etherBalancesAreEqual,
  etherBalancesAreAtLeast,
  tokenBalancesAreAtLeast,
  tokenBalancesAreEqual,
  etherFaucet,
  erc20Faucet,
  erc721Faucet,
  addressesAreEqual,
  constants,
  bigNumberify,
  gasParams,
  ProviderFactory,
  accounts,
  developmentConfig,
};

export default helpers;
