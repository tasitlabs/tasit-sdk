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
import {
  gasParams,
  setupContracts,
  prepareTokens,
  duration,
} from "./testHelpers/helpers";

const ownerPrivKey =
  "0x11d943d7649fbdeb146dc57bd9cfc80b086bfab2330c7b25651dbaf382392f60";
const anaPrivKey =
  "0xc181b6b02c9757f13f5aa15d1342a58970a8a489722dc0608a1d09fea717c181";
const bobPrivKey =
  "0x4f09311114f0ff4dfad0edaa932a3e01a4ee9f34da2cbd087aa0e6ffcb9eb322";

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

  // TODO: extract setWallet to here and split beforeEach
  beforeEach("", async () => {
    snapshotId = await createSnapshot(provider);

    ({ mana, land, estate, marketplace } = await setupContracts(owner));

    await prepareTokens(mana, land, estate, owner, ana, bob);

    const landData = await land.landData(0, 1);
    expect(landData).to.equals("parcel one");

    const estateData = await estate.getMetadata(1);
    expect(estateData).to.equals("cool estate");

    const totalSupply = await land.totalSupply();
    expect(totalSupply.toNumber()).to.equal(2);

    const parcelsBalance = await land.balanceOf(ana.address);
    expect(parcelsBalance.toNumber()).to.equal(0);

    const estateBalance = await estate.balanceOf(ana.address);
    expect(estateBalance.toNumber()).to.equal(1);

    await mineBlocks(provider, 1);
  });

  afterEach("", async () => {
    await revertFromSnapshot(provider, snapshotId);
  });

  // in weis
  const ONE = 1e18;
  const TEN = 10e18;

  it("", async () => {
    land.setWallet(ana);
    const marketplaceApproval = land.setApprovalForAll(
      marketplace.getAddress(),
      true,
      gasParams
    );
    await marketplaceApproval.waitForNonceToUpdate();

    const manaMint = mana.mint(bob.address, TEN.toString());
    await manaMint.waitForNonceToUpdate();

    const bobBalance = await mana.balanceOf(bob.address);
    expect(bobBalance.toString()).to.equal(TEN.toString());

    // mana.setWallet(bob);
    // const manaApprove = mana.approve(marketplace.getAddress(), ONE.toString());
    // await manaApprove.waitForNonceToUpdate();

    // marketplace.setWallet(ana);
    // const assetId = 1;
    // const priceInWei = TEN.toString();
    // const expireAt = duration.hours(1);
    // const createOrder = marketplace.createOrder(
    //   land.getAddress(),
    //   assetId,
    //   priceInWei,
    //   expireAt,
    //   gasParams
    // );
    // await createOrder.waitForNonceToUpdate();
  });
});
