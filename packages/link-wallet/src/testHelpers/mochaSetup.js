// Chai
import { expect } from "chai";
global.expect = expect;

// Helpers
import actionHelpers from "@tasit/action/dist/testHelpers/helpers";
const {
  developmentConfig,
  ProviderFactory,
  createSnapshot,
  revertFromSnapshot,
  mineBlocks,
} = actionHelpers;

import Action from "@tasit/action";
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
