// TODO: Determine why we get this error
// SyntaxError: Cannot use import statement outside a module
// when calling this with the mocha --file flag before the test suite runs

// Chai
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

// TODO: Decide if we still want to set globals here or if we're comfortable
// with the same imports of expect and sinon in each test file

// Helpers
import { createSnapshot, revertFromSnapshot, mineBlocks } from "@tasit/test-helpers";
import ProviderFactory from "../ProviderFactory";
import ConfigLoader from "../ConfigLoader";
import config from "../config/default";
ConfigLoader.setConfig(config);

// Global hooks
const provider = ProviderFactory.getProvider();
let snapshotId;

beforeEach(async () => {
  snapshotId = await createSnapshot(provider);

  while (snapshotId > 1) {
    await revertFromSnapshot(provider, snapshotId--);
  }

  expect(snapshotId).to.equal(1);
});

afterEach(async () => {
  expect(snapshotId).to.equal(1);
  await revertFromSnapshot(provider, snapshotId);

  // Note: Without this the test suite is breaking.
  // It is still unclear why
  await mineBlocks(provider, 1);
});
