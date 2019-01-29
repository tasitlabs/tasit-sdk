import { Account, Action } from "./TasitSdk";
const { Contract, NFT } = Action;
import { expect, assert } from "chai";
import { createFromPrivateKey } from "tasit-account/dist/testHelpers/helpers";
import {
  mineBlocks,
  createSnapshot,
  revertFromSnapshot,
} from "tasit-action/dist/testHelpers/helpers";
import { abi as manaABI } from "./testHelpers/MANAToken.json";
import { abi as landRegistryABI } from "./testHelpers/LANDRegistry.json";
import { abi as landProxyABI } from "./testHelpers/LANDProxy.json";
import { abi as estateRegistryABI } from "./testHelpers/EstateRegistry.json";
import { abi as markplaceABI } from "./testHelpers/Marketplace.json";

const ownerPrivKey =
  "0x11d943d7649fbdeb146dc57bd9cfc80b086bfab2330c7b25651dbaf382392f60";
const anaPrivKey =
  "0xc181b6b02c9757f13f5aa15d1342a58970a8a489722dc0608a1d09fea717c181";
const bobPrivKey =
  "0x4f09311114f0ff4dfad0edaa932a3e01a4ee9f34da2cbd087aa0e6ffcb9eb322";

const manaAddress = "0xb32939da0c44bf255b9810421a55be095f9bb3f4";
const landRegistryAddress = "0x6191bc768c2339da9eab9e589fc8bf0b3ab80975";
const landProxyAddress = "0x773f11ed472aa43e4ebaa963bcfbbea5a10c1bbd";
const estateRegistryAddress = "0x41b598a2c618b59b74540ac3afffb32f7971b37a";
const marketplaceAddress = "0x289c42facf691946b64b4370361b1303f0a463ef";

describe("Decentraland", () => {
  let owner;
  let ana;
  let bob;
  let ephemeral;
  let mana;
  let landRegistry;
  let landProxy;
  let estateRegistry;
  let marketplace;
  let snapshotId;
  let provider;

  before("", async () => {
    owner = createFromPrivateKey(ownerPrivKey);
    ana = createFromPrivateKey(anaPrivKey);
    bob = createFromPrivateKey(bobPrivKey);
    ephemeral = Account.create();

    expect(owner.address).to.have.lengthOf(42);
    expect(ana.address).to.have.lengthOf(42);
    expect(bob.address).to.have.lengthOf(42);
    expect(ephemeral.address).to.have.lengthOf(42);

    // Note: It would be cooler to use NFT here if
    // Decentraland Land contract followed ERC721 exactly
    mana = new Contract(manaAddress, manaABI, owner);
    landRegistry = new Contract(landRegistryAddress, landRegistryABI, owner);
    landProxy = new Contract(landProxyAddress, landProxyABI, owner);
    estateRegistry = new Contract(
      estateRegistryAddress,
      estateRegistryABI,
      owner
    );
    marketplace = new Contract(marketplaceAddress, markplaceABI, owner);

    provider = mana._getProvider();
  });

  beforeEach("", async () => {
    snapshotId = await createSnapshot(provider);
    await mineBlocks(provider, 1);
  });

  afterEach("", async () => {
    await revertFromSnapshot(provider, snapshotId);
  });

  // Note: Test case with nonce error
  // Investigating if that is ocurring by same wallet on both contracts
  it.skip("setup contracts", async () => {
    // TODO: Fill out this test more

    const landInitializeAction = landRegistry.initialize(owner.address);
    landInitializeAction.waitForNonceToUpdate();

    const landProxyUpgradeAction = landProxy.upgrade(
      landRegistry.getAddress(),
      owner.address
    );
    landProxyUpgradeAction.waitForNonceToUpdate();

    //const setRegistryAction = land.setEstateRegistry(estate.getAddress());
    //setRegistryAction.waitForNonceToUpdate();
    // //land.createEstate([0], [0], owner.address);
    //
    // const action2 = estate.initialize("Estate", "EST", land.getAddress());
    // action2.waitForNonceToUpdate();
    //
    // const action3 = estate.setLANDRegistry(land.getAddress());
    // action3.waitForNonceToUpdate();
  });
});
