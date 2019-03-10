// Chai
import { expect } from "chai";
global.expect = expect;

// Helpers
import helpers from "./helpers";
global = Object.assign(global, helpers);

// External helpers
//
// Note:  Using dist file because babel doesn't compile node_modules files.
// Any changes on src should be followed by compilation to avoid unexpected behaviors.
// Note that lerna bootstrap does this for you since it
// runs prepare in all bootstrapped packages.
// Refs: https://github.com/lerna/lerna/tree/master/commands/bootstrap
import { createFromPrivateKey } from "tasit-account/dist/testHelpers/helpers";
global.createFromPrivateKey = createFromPrivateKey;

import { Action } from "../TasitSdk";
const { ConfigLoader } = Action;
import config from "../config/default.js";
ConfigLoader.setConfig(config);

const { provider: configProvider } = config;
const { network } = configProvider;

import TasitContracts from "../../../tasit-contracts/dist";
const { local, goerli, ropsten } = TasitContracts;
let blockchain;
if (network === "goerli") blockchain = goerli;
else if (network === "ropsten") blockchain = ropsten;
else blockchain = local;
const { MANAToken, LANDProxy, EstateRegistry, Marketplace } = blockchain;
const { address: MANA_ADDRESS } = MANAToken;
const { address: LAND_PROXY_ADDRESS } = LANDProxy;
const { address: ESTATE_ADDRESS } = EstateRegistry;
const { address: MARKETPLACE_ADDRESS } = Marketplace;
global.MANA_ADDRESS = MANA_ADDRESS;
global.LAND_PROXY_ADDRESS = LAND_PROXY_ADDRESS;
global.ESTATE_ADDRESS = ESTATE_ADDRESS;
global.MARKETPLACE_ADDRESS = MARKETPLACE_ADDRESS;

// Global hooks
let snapshotId;

before("global before() hook", async () => {
  const provider = ProviderFactory.getProvider();
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
