import { expect } from "chai";
import { ethers } from "ethers";

export const waitForEvent = async (contract, eventName, expected) => {
  return new Promise(function(resolve, reject) {
    contract.on(eventName, function() {
      const args = Array.prototype.slice.call(arguments);
      const event = args.pop();
      event.removeListener();
      expect(
        args,
        `${event.event} event should have expected args`
      ).to.deep.equal(expected);
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

export default { waitForEvent, mineBlocks, createSnapshot, revertFromSnapshot };
