// Chai
import { expect } from "chai";
global.expect = expect;

// Helpers
import actionHelpers from "tasit-action/dist/testHelpers/helpers";
global = Object.assign(global, actionHelpers);

import Action from "tasit-action";
const { ConfigLoader } = Action;
const config = {
  provider: {
    network: "other",
    provider: "jsonrpc",
    pollingInterval: 50,
    jsonRpc: {
      url: "http://localhost",
      port: 8545,
    },
  },
  events: {
    timeout: 2000,
  },
};
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
