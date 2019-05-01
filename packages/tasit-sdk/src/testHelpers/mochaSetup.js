// Chai
import { expect } from "chai";
global.expect = expect;

// Helpers
import helpers from "./helpers";
global = Object.assign(global, helpers);

import { Action } from "../TasitSdk";
const { ConfigLoader } = Action;
import config from "../config/default";
ConfigLoader.setConfig(config);

const provider = ProviderFactory.getProvider();

const { _network: network } = provider;
const networkName = !network ? "local" : network.name;

import TasitContracts from "tasit-contracts";
const {
  MANAToken,
  LANDProxy,
  EstateRegistry,
  Marketplace,
  GnosisSafe,
} = TasitContracts[networkName];
const { address: MANA_ADDRESS } = MANAToken;
const { address: LAND_PROXY_ADDRESS } = LANDProxy;
const { address: ESTATE_ADDRESS } = EstateRegistry;
const { address: MARKETPLACE_ADDRESS } = Marketplace;
const { address: GNOSIS_SAFE_ADDRESS } = GnosisSafe;
global.MANA_ADDRESS = MANA_ADDRESS;
global.LAND_PROXY_ADDRESS = LAND_PROXY_ADDRESS;
global.ESTATE_ADDRESS = ESTATE_ADDRESS;
global.MARKETPLACE_ADDRESS = MARKETPLACE_ADDRESS;
global.GNOSIS_SAFE_ADDRESS = GNOSIS_SAFE_ADDRESS;

// Global hooks
let snapshotId;

before("global before() hook", async () => {
  global.provider = provider;
});

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
