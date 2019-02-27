import { ethers } from "ethers";

// Chai
import { expect, assert } from "chai";
global.expect = expect;
//global.assert = assert;

// Helpers
import actionHelpers from "../../../tasit-action/dist/testHelpers/helpers";
global = Object.assign(global, actionHelpers);

// Global hooks
let snaphotId;

beforeEach("global beforeEach() hook", async () => {
  const provider = new ethers.providers.JsonRpcProvider();
  provider.pollingInterval = 50;
  global.provider = provider;
  snaphotId = await createSnapshot(provider);
  expect(`${snaphotId}`).to.equal(`0x1`);
});

afterEach("global afterEach() hook", async () => {
  await revertFromSnapshot(provider, snaphotId);

  // Note: Without this the test suite is breaking.
  // It is still unclear why
  await mineBlocks(provider, 1);
});
