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
