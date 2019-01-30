import { Account, Action } from "./TasitSdk";
const { Contract, NFT } = Action;
import { expect, assert } from "chai";
import { createFromPrivateKey } from "tasit-account/dist/testHelpers/helpers";
// The goal of this integration test suite is to use only exposed classes
// from TasitSdk, ProviderFactory has been used here for a clearer code.
import ProviderFactory from "tasit-action/dist/ProviderFactory";
import {
  mineBlocks,
  createSnapshot,
  revertFromSnapshot,
  confirmBalances,
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

// in weis
const ONE = 1e18;
const TEN = 10e18;

// Note: Extract Decentraland test cases to a specific test suite when other
// use case will be tested.
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

  beforeEach("", async () => {
    snapshotId = await createSnapshot(provider);

    // Note: In future we can have other ERC20 than Mana to test the Marketplace orders
    ({ mana, land, estate, marketplace } = await setupContracts(owner));

    await prepareTokens(mana, land, estate, owner, seller, buyer);

    const land1 = { x: 0, y: 1 };
    const land2 = { x: 0, y: 2 };

    const land1Data = await land.landData(land1.x, land1.y);
    expect(land1Data).to.equal("parcel one");

    const estateData = await estate.getMetadata(1);
    expect(estateData).to.equal("cool estate");

    const totalSupply = await land.totalSupply();
    expect(totalSupply.toNumber()).to.equal(2);

    await confirmBalances(land, [seller.address], [0]);

    await confirmBalances(estate, [seller.address], [1]);

    await mineBlocks(provider, 1);
  });

  afterEach("", async () => {
    await revertFromSnapshot(provider, snapshotId);
  });

  describe("Marketplace", () => {
    // TODO: Assign different contract objects for each wallet (avoiding setWallet)
    beforeEach(
      "buyer and seller approve marketplace contract to transfer tokens on their behalf",
      async () => {
        mana.setWallet(owner);
        const mintManaToBuyer = mana.mint(buyer.address, TEN.toString());
        await mintManaToBuyer.waitForNonceToUpdate();
        await confirmBalances(mana, [buyer.address], [TEN]);

        mana.setWallet(buyer);
        const marketplaceApprovalByBuyer = mana.approve(
          marketplace.getAddress(),
          ONE.toString()
        );
        await marketplaceApprovalByBuyer.waitForNonceToUpdate();

        estate.setWallet(seller);
        const marketplaceApprovalBySeller = estate.setApprovalForAll(
          marketplace.getAddress(),
          true,
          gasParams
        );
        await marketplaceApprovalBySeller.waitForNonceToUpdate();
      }
    );

    it("should execute an order", async () => {
      await confirmBalances(estate, [buyer.address, seller.address], [0, 1]);

      const assetId = 1;
      const priceInWei = ONE.toString();
      const expireAt = Date.now() + duration.hours(1);

      marketplace.setWallet(seller);
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

      await confirmBalances(estate, [buyer.address, seller.address], [1, 0]);
    });
  });
});
