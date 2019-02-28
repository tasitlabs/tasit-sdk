import { ethers } from "ethers";

// Chai
import { expect, assert } from "chai";
global.expect = expect;
//global.assert = assert;

// Helpers
import actionHelpers from "../../../tasit-action/dist/testHelpers/helpers";
global = Object.assign(global, actionHelpers);

// Global hooks
let snapshotId;

beforeEach("global beforeEach() hook", async () => {
  const provider = new ethers.providers.JsonRpcProvider();
  provider.pollingInterval = 50;
  global.provider = provider;
  snapshotId = await createSnapshot(provider);

  while (snapshotId > 1) {
    await revertFromSnapshot(provider, snapshotId--);
  }

  expect(snapshotId).to.equal(1);
});

afterEach("global afterEach() hook", async () => {
  expect(snapshotId).to.equal(1);
  await revertFromSnapshot(provider, snapshotId);

  // Note: Without this the test suite is breaking.
  // It is still unclear why
  await mineBlocks(provider, 1);
});
