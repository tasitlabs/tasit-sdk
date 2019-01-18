// Chai
import chai, { expect } from "chai";
global.expect = expect;
chai.use(require("chai-as-promised"));

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
} from "./helpers";
global.mineBlocks = mineBlocks;
global.createSnapshot = createSnapshot;
global.revertFromSnapshot = revertFromSnapshot;
global.wait = wait;
global.waitForEthersEvent = waitForEthersEvent;

// External helpers
//
// Note:  Using dist file because babel doesn't compile node_modules files.
// Any changes on src should be followed by compilation to avoid unexpected behaviors.
import { createFromPrivateKey } from "tasit-account/dist/testHelpers/helpers";
global.createFromPrivateKey = createFromPrivateKey;
