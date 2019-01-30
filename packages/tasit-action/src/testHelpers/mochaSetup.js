import BN from "bn.js";
global.BN = BN;

// Chai
import chai, { expect } from "chai";
global.expect = expect;
chai.use(require("chai-as-promised"));
chai.use(require("chai-bn")(BN));

// Sinon
import sinon from "sinon";
global.sinon = sinon;

// Helpers
import {
  mineBlocks,
  createSnapshot,
  revertFromSnapshot,
  wait,
  waitForEthersEvent,
  toBN,
  confirmBalances,
} from "./helpers";
global.mineBlocks = mineBlocks;
global.createSnapshot = createSnapshot;
global.revertFromSnapshot = revertFromSnapshot;
global.wait = wait;
global.waitForEthersEvent = waitForEthersEvent;
global.toBN = toBN;
global.confirmBalances = confirmBalances;

// External helpers
//
// Note:  Using dist file because babel doesn't compile node_modules files.
// Any changes on src should be followed by compilation to avoid unexpected behaviors.
// Note that lerna bootstrap does this for you since it
// runs prepare in all bootstrapped packages.
// Refs: https://github.com/lerna/lerna/tree/master/commands/bootstrap
import { createFromPrivateKey } from "tasit-account/dist/testHelpers/helpers";
global.createFromPrivateKey = createFromPrivateKey;
