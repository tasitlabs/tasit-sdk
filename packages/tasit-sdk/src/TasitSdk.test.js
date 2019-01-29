import { Account, Action } from "./TasitSdk";
const { Contract, NFT } = Action;
import { expect, assert } from "chai";
import { createFromPrivateKey } from "tasit-account/dist/testHelpers/helpers";
import ProviderFactory from "tasit-action/dist/ProviderFactory";
import {
  mineBlocks,
  createSnapshot,
  revertFromSnapshot,
} from "tasit-action/dist/testHelpers/helpers";
import { abi as manaABI } from "./testHelpers/MANAToken.json";
import { abi as landABI } from "./testHelpers/LANDRegistry.json";
import { abi as landProxyABI } from "./testHelpers/LANDProxy.json";
import { abi as estateABI } from "./testHelpers/EstateRegistry.json";
import { abi as markplaceABI } from "./testHelpers/Marketplace.json";

const ownerPrivKey =
  "0x11d943d7649fbdeb146dc57bd9cfc80b086bfab2330c7b25651dbaf382392f60";
const anaPrivKey =
  "0xc181b6b02c9757f13f5aa15d1342a58970a8a489722dc0608a1d09fea717c181";
const bobPrivKey =
  "0x4f09311114f0ff4dfad0edaa932a3e01a4ee9f34da2cbd087aa0e6ffcb9eb322";

const manaAddress = "0xb32939da0c44bf255b9810421a55be095f9bb3f4";
const landAddress = "0x6191bc768c2339da9eab9e589fc8bf0b3ab80975";
const landProxyAddress = "0x773f11ed472aa43e4ebaa963bcfbbea5a10c1bbd";
const estateAddress = "0x41b598a2c618b59b74540ac3afffb32f7971b37a";
const marketplaceAddress = "0x289c42facf691946b64b4370361b1303f0a463ef";

// TODO: Go deep on gas handling.
// Without that, VM returns a revert error instead of out of gas error.
// See: https://github.com/tasitlabs/TasitSDK/issues/173
const gasParams = {
  gasLimit: 7e6,
  gasPrice: 1e9,
};

const setupContracts = async owner => {
  // Note: It would be cooler to use NFT here if
  // Decentraland Land contract followed ERC721 exactly
  const mana = new Contract(manaAddress, manaABI, owner);
  let land = new Contract(landAddress, landABI, owner);
  const landProxy = new Contract(landProxyAddress, landProxyABI, owner);
  const estate = new Contract(estateAddress, estateABI, owner);
  const marketplace = new Contract(marketplaceAddress, markplaceABI, owner);

  const landProxyUpgrade = landProxy.upgrade(
    land.getAddress(),
    owner.address,
    gasParams
  );
  await landProxyUpgrade.waitForNonceToUpdate();

  const estateInitialize = estate.initialize(
    "Estate",
    "EST",
    landProxy.getAddress()
  );
  await estateInitialize.waitForNonceToUpdate();

  land = new Contract(landProxy.getAddress(), landABI, owner);

  const landInitialize = land.initialize(owner.address, gasParams);
  await landInitialize.waitForNonceToUpdate();

  const landEstateSetup = land.setEstateRegistry(
    estate.getAddress(),
    gasParams
  );
  await landEstateSetup.waitForNonceToUpdate();

  return {
    mana,
    land,
    estate,
    marketplace,
  };
};

const populateLands = async (land, estate, owner, beneficiary) => {
  let parcelsBalance;
  let estateBalance;

  const auth = land.authorizeDeploy(owner.address, gasParams);
  await auth.waitForNonceToUpdate();

  const parcelsAssignment = land.assignMultipleParcels(
    [0, 0],
    [1, 2],
    beneficiary.address,
    gasParams
  );
  await parcelsAssignment.waitForNonceToUpdate();

  parcelsBalance = await land.balanceOf(beneficiary.address);
  expect(parcelsBalance.toNumber()).to.equal(2);

  expect(await land.ownerOfLand(0, 1)).to.equal(beneficiary.address);

  land.setWallet(beneficiary);
  const updateParcel1 = land.updateLandData(0, 1, "parcel one", gasParams);
  await updateParcel1.waitForNonceToUpdate();

  const updateParcel2 = land.updateLandData(0, 2, "parcel two", gasParams);
  await updateParcel2.waitForNonceToUpdate();

  const createEstate = land.createEstateWithMetadata(
    [0, 0],
    [1, 2],
    beneficiary.address,
    "cool estate",
    gasParams
  );
  await createEstate.waitForNonceToUpdate();

  const landData = await land.landData(0, 1);
  expect(landData).to.equals("parcel one");

  const estateData = await estate.getMetadata(1);
  expect(estateData).to.equals("cool estate");

  const totalSupply = await land.totalSupply();
  expect(totalSupply.toNumber()).to.equal(2);

  parcelsBalance = await land.balanceOf(beneficiary.address);
  expect(parcelsBalance.toNumber()).to.equal(0);

  estateBalance = await estate.balanceOf(beneficiary.address);
  expect(estateBalance.toNumber()).to.equal(1);
};

describe("Decentraland", () => {
  let owner;
  let ana;
  let bob;
  let ephemeral;
  let mana;
  let land;
  let landProxy;
  let estate;
  let marketplace;
  let snapshotId;
  let provider;

  before("", async () => {
    provider = ProviderFactory.getProvider();

    owner = createFromPrivateKey(ownerPrivKey);
    ana = createFromPrivateKey(anaPrivKey);
    bob = createFromPrivateKey(bobPrivKey);
    ephemeral = Account.create();

    expect(owner.address).to.have.lengthOf(42);
    expect(ana.address).to.have.lengthOf(42);
    expect(bob.address).to.have.lengthOf(42);
    expect(ephemeral.address).to.have.lengthOf(42);
  });

  beforeEach("", async () => {
    snapshotId = await createSnapshot(provider);
    ({ mana, land, estate, marketplace } = await setupContracts(owner));
    await populateLands(land, estate, owner, ana);
    await mineBlocks(provider, 1);
  });

  afterEach("", async () => {
    await revertFromSnapshot(provider, snapshotId);
  });

  it("create parcels", async () => {
    const estateBalance = await estate.balanceOf(ana.address);
    expect(estateBalance.toNumber()).to.equal(1);
  });
});
