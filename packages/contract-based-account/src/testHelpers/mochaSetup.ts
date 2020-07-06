// Chai
import { expect } from "chai";


import sinon from "sinon";

// Helpers
import actionHelpers from "@tasit/test-helpers";

import Action from "@tasit/action";
global.expect = expect;
global.sinon = sinon;
const {
  developmentConfig,
  ProviderFactory,
  createSnapshot,
  revertFromSnapshot,
  mineBlocks,
} = actionHelpers;
const { ConfigLoader } = Action;
ConfigLoader.setConfig(developmentConfig);

// Global hooks
const provider = ProviderFactory.getProvider();
let snapshotId;

beforeEach("global beforeEach() hook", async () => {
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
