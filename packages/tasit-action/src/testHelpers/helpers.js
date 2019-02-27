import { expect } from "chai";
import { ethers } from "ethers";
import ProviderFactory from "../ProviderFactory";

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
  return await provider.send("evm_snapshot", []);
};

const revertFromSnapshot = async (provider, snapshotId) => {
  await provider.send("evm_revert", [snapshotId]);
};

const wait = async ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const confirmBalances = async (token, addresses, balances) => {
  expect(addresses.length).to.equal(balances.length);
  let index = 0;
  for (let address of addresses) {
    const balance = await token.balanceOf(address);
    const expectedBalance = balances[index++];
    expect(balance.toString()).to.equal(expectedBalance.toString());
  }
};

// Note: ethers created their own BigNumber type that encapsulates BN.js
// Because of that, exists the need of extra parses between user and our API (see tests)
// Should we:
// - Try to intercept and parse ethers.BigNumber to BN.js (and vice-versa)?
// or
// - Exposes ethers.utils.BigNumber / bigNumberify()?
const toBN = ethersBN => {
  return new BN(ethersBN.toString());
};

const etherFaucet = async (
  provider,
  fromWallet,
  beneficiaryAddress,
  amountInWei
) => {
  const connectedFromWallet = fromWallet.connect(provider);
  const tx = await connectedFromWallet.sendTransaction({
    // ethers.utils.parseEther("1.0")
    value: "0x0de0b6b3a7640000",
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
  await confirmBalances(tokenContract, [toAddress], [amountInWei]);
};

const erc721Faucet = async (tokenContract, ownerWallet, toAddress, tokenId) => {
  tokenContract.setWallet(ownerWallet);
  const mintAction = tokenContract.mint(toAddress, tokenId);
  await mintAction.waitForNonceToUpdate();
  await confirmBalances(tokenContract, [toAddress], [1]);
};

const addressesAreEqual = (address1, address2) => {
  return address1.toUpperCase() === address2.toUpperCase();
};

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
const BILLION = bigNumberify(`${1e9}`).mul(WeiPerEther);

const constants = {
  ZERO,
  ONE,
  TEN,
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

export const helpers = {
  waitForEthersEvent,
  mineBlocks,
  createSnapshot,
  revertFromSnapshot,
  wait,
  toBN,
  confirmBalances,
  etherFaucet,
  erc20Faucet,
  erc721Faucet,
  addressesAreEqual,
  constants,
  bigNumberify,
  gasParams,
  ProviderFactory,
};

export default helpers;
