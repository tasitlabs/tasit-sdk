// Helpers
import { createSnapshot, revertFromSnapshot, mineBlocks } from "@tasit/test-helpers";
import ProviderFactory from "./src/ProviderFactory";
import ConfigLoader from "./src/ConfigLoader";
import config from "./src/config/default";
ConfigLoader.setConfig(config);

// Global hooks
const provider = ProviderFactory.getProvider();
let snapshotId;

beforeEach(async () => {
  snapshotId = await createSnapshot(provider);

  while (snapshotId > 1) {
    await revertFromSnapshot(provider, snapshotId--);
  }

  expect(snapshotId).toEqual(1);
});

afterEach(async () => {
  expect(snapshotId).toEqual(1);
  await revertFromSnapshot(provider, snapshotId);

  // Note: Without this the test suite is breaking.
  // It is still unclear why
  await mineBlocks(provider, 1);
});
