"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.mineBlocks = exports.waitForEvent = void 0;

var _chai = require("chai");

var _ethers = require("ethers");

const waitForEvent = async (contract, eventName, expected) => {
  return new Promise(function (resolve, reject) {
    contract.on(eventName, function () {
      const args = Array.prototype.slice.call(arguments);
      const event = args.pop();
      event.removeListener();
      (0, _chai.expect)(args, `${event.event} event should have expected args`).to.deep.equal(expected);
      resolve();
    });
  });
};

exports.waitForEvent = waitForEvent;

const mineOneBlock = async provider => {
  await provider.send("evm_increaseTime", [1]);
  await provider.send("evm_mine", []);
};

const mineBlocks = async (provider, n) => {
  for (let i = 0; i < n; i++) {
    await mineOneBlock(provider);
  }
};

exports.mineBlocks = mineBlocks;
var _default = {
  waitForEvent,
  mineBlocks
};
exports.default = _default;