// Chai
import { expect } from "chai";
global.expect = expect;

// Load config
import { Action } from "../TasitSdk";
const { ConfigLoader } = Action;
import config from "../config/default";
ConfigLoader.setConfig(config);

// Helpers
import helpers from "./helpers";
const {
  ProviderFactory,
  createSnapshot,
  revertFromSnapshot,
  mineBlocks,
} = helpers;

const provider = ProviderFactory.getProvider();

// Global hooks
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
