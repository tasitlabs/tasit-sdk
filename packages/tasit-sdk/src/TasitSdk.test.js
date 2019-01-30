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
const sellerPrivKey =
  "0xc181b6b02c9757f13f5aa15d1342a58970a8a489722dc0608a1d09fea717c181";
const buyerPrivKey =
  "0x4f09311114f0ff4dfad0edaa932a3e01a4ee9f34da2cbd087aa0e6ffcb9eb322";

describe("Decentraland", () => {
  let owner;
  let seller;
  let buyer;
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
    seller = createFromPrivateKey(sellerPrivKey);
    buyer = createFromPrivateKey(buyerPrivKey);
    ephemeral = Account.create();

    expect(owner.address).to.have.lengthOf(42);
    expect(seller.address).to.have.lengthOf(42);
    expect(buyer.address).to.have.lengthOf(42);
    expect(ephemeral.address).to.have.lengthOf(42);
  });

  // TODO: extract setWallet to here and split beforeEach
  beforeEach("", async () => {
    snapshotId = await createSnapshot(provider);

    ({ mana, land, estate, marketplace } = await setupContracts(owner));

    await prepareTokens(mana, land, estate, owner, seller, buyer);

    const landData = await land.landData(0, 1);
    expect(landData).to.equals("parcel one");

    const estateData = await estate.getMetadata(1);
    expect(estateData).to.equals("cool estate");

    const totalSupply = await land.totalSupply();
    expect(totalSupply.toNumber()).to.equal(2);

    const parcelsBalance = await land.balanceOf(seller.address);
    expect(parcelsBalance.toNumber()).to.equal(0);

    const estateBalance = await estate.balanceOf(seller.address);
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
    let sellerManaBalance;
    let sellerEstateBalance;
    let buyerManaBalance;
    let buyerEstateBalance;

    estate.setWallet(seller);
    const marketplaceApproval = estate.setApprovalForAll(
      marketplace.getAddress(),
      true,
      gasParams
    );
    await marketplaceApproval.waitForNonceToUpdate();

    const manaMint = mana.mint(buyer.address, TEN.toString());
    await manaMint.waitForNonceToUpdate();

    const buyerBalance = await mana.balanceOf(buyer.address);
    expect(buyerBalance.toString()).to.equal(TEN.toString());

    mana.setWallet(buyer);
    const manaApprove = mana.approve(marketplace.getAddress(), ONE.toString());
    await manaApprove.waitForNonceToUpdate();

    buyerEstateBalance = await estate.balanceOf(buyer.address);
    expect(buyerEstateBalance.toNumber()).to.equal(0);

    sellerEstateBalance = await estate.balanceOf(seller.address);
    expect(sellerEstateBalance.toNumber()).to.equal(1);

    marketplace.setWallet(seller);
    const assetId = 1;
    const priceInWei = ONE.toString();
    const expireAt = Date.now() + duration.hours(1);
    const createOrder = marketplace.createOrder(
      estate.getAddress(),
      assetId,
      priceInWei,
      expireAt,
      gasParams
    );
    await createOrder.waitForNonceToUpdate();

    marketplace.setWallet(buyer);
    const executeOrder = marketplace.executeOrder(
      estate.getAddress(),
      assetId,
      priceInWei,
      gasParams
    );
    await executeOrder.waitForNonceToUpdate();

    buyerEstateBalance = await estate.balanceOf(buyer.address);
    expect(buyerEstateBalance.toNumber()).to.equal(1);

    sellerEstateBalance = await estate.balanceOf(seller.address);
    expect(sellerEstateBalance.toNumber()).to.equal(0);
  });
});
