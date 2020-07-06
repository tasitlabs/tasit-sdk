// Helpers
import helpers from "@tasit/test-helpers";

import Action from "@tasit/action";

const {
  developmentConfig,
  ProviderFactory,
  createSnapshot,
  revertFromSnapshot,
  mineBlocks,
} = helpers;

const { ConfigLoader } = Action;
ConfigLoader.setConfig(developmentConfig);

// Global hooks
const provider = ProviderFactory.getProvider();
let snapshotId;

// TODO: Potentially move this before each function into
// @tasit/test-helpers
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
