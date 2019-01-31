import { expect } from "chai";
import { ethers } from "ethers";

export const waitForEthersEvent = async (eventEmitter, eventName, callback) => {
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

export const mineBlocks = async (provider, n) => {
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
  return await provider.send("evm_snapshot", []);
};

export const revertFromSnapshot = async (provider, snapshotId) => {
  await provider.send("evm_revert", [snapshotId]);
};

export const wait = async ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const confirmBalances = async (token, addresses, balances) => {
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
export const toBN = ethersBN => {
  return new BN(ethersBN.toString());
};

export default {
  waitForEthersEvent,
  mineBlocks,
  createSnapshot,
  revertFromSnapshot,
  wait,
  toBN,
  confirmBalances,
};
