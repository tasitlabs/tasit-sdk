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

export default {
  waitForEthersEvent,
  mineBlocks,
  createSnapshot,
  revertFromSnapshot,
  wait,
};
