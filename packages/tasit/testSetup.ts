// Load config
import { Action } from "./src/TasitSdk";
const { ConfigLoader } = Action;
import config from "./src/config/development";
ConfigLoader.setConfig(config);

// Helpers
import helpers from "@tasit/test-helpers";
const {
  ProviderFactory,
  createSnapshot,
  revertFromSnapshot,
  mineBlocks,
} = helpers;

const provider = ProviderFactory.getProvider();

// Global hooks
let snapshotId;

beforeEach(async () => {
  snapshotId = await createSnapshot(provider);

  while (snapshotId > 1) {
    await revertFromSnapshot(provider, snapshotId--);
  }

  expect(snapshotId).toBe(1);
});

afterEach(async () => {
  expect(snapshotId).toBe(1);
  await revertFromSnapshot(provider, snapshotId);

  // Note: Without this the test suite is breaking.
  // It is still unclear why
  await mineBlocks(provider, 1);
});
