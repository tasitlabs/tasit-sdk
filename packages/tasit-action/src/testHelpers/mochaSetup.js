// Chai
import chai, { expect } from "chai";
global.expect = expect;
chai.use(require("chai-as-promised"));

// Sinon
import sinon from "sinon";
global.sinon = sinon;

// Helpers
import actionHelpers from "./helpers";
global = Object.assign(global, actionHelpers);

import ConfigLoader from "../ConfigLoader";
import config from "../config/default";
ConfigLoader.setConfig(config);

// Global hooks
let snapshotId;

beforeEach("global beforeEach() hook", async () => {
  const provider = ProviderFactory.getProvider();
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
