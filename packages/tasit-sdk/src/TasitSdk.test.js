import { Account, Action } from "./TasitSdk";
const { Contract, NFT } = Action;
import { expect, assert } from "chai";
import { createFromPrivateKey } from "tasit-account/dist/testHelpers/helpers";
// The goal of this integration test suite is to use only exposed classes
// from TasitSdk. ProviderFactory is used here as an exception
// as the clearest way to get a provider
// in this test suite. Eventually, maybe ProviderFactory may move to
// some shared helper dir.
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
  duration,
  createParcels,
  createEstatesFromParcels,
  getEstateSellOrder,
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
// use cases will be tested.
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
  let estateIds;

  const manaFaucetTo = async (beneficiary, amountInWei) => {
    mana.setWallet(owner);
    const mintManaToBuyer = mana.mint(
      beneficiary.address,
      amountInWei.toString()
    );
    await mintManaToBuyer.waitForNonceToUpdate();
    await confirmBalances(mana, [beneficiary.address], [amountInWei]);
  };

  const etherFaucetTo = async (beneficiary, amountInWei) => {
    const connectedOwner = owner.connect(provider);
    const tx = await connectedOwner.sendTransaction({
      // ethers. utils.parseEther("1.0")
      value: "0x0de0b6b3a7640000",
      to: beneficiary.address,
    });
    await provider.waitForTransaction(tx.hash);
  };

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

    const parcels = [
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 0, y: 5 },
    ];

    // Note: Often estates have more than one parcel of land in them
    // but here we just have one parcel of land in each to keep this test short
    estateIds = await createEstatesFromParcels(estate, land, parcels, seller);

    const estateData = await estate.getMetadata(estateIds[0]);
    expect(estateData).to.equal(`cool estate ${parcels[0].x}x${parcels[0].y}`);

    const totalSupply = await land.totalSupply();
    expect(totalSupply.toNumber()).to.equal(parcels.length);

    // After became part of an estate, parcels are no more accounted as LAND balance
    await confirmBalances(land, [seller.address], [0]);

    await confirmBalances(estate, [seller.address], [estateIds.length]);

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
        manaFaucetTo(buyer, TEN);

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
      await confirmBalances(
        estate,
        [buyer.address, seller.address],
        [0, estateIds.length]
      );

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

      await confirmBalances(
        estate,
        [buyer.address, seller.address],
        [1, estateIds.length - 1]
      );
    });

    describe("Decentraland tasit app test cases", () => {
      beforeEach(
        "create sell orders and remove wallets from contracts",
        async () => {
          marketplace.setWallet(seller);
          for (let assetId of estateIds) {
            const priceInWei = ONE.toString();
            const expireAt = Date.now() + duration.years(1);
            const createOrder = marketplace.createOrder(
              estate.getAddress(),
              assetId,
              priceInWei,
              expireAt,
              gasParams
            );
            await createOrder.waitForNonceToUpdate();
          }

          mana.removeWallet();
          land.removeWallet();
          estate.removeWallet();
          marketplace.removeWallet();
        }
      );

      it("should list marketplace estates sell orders (without wallet)", async () => {
        const orders = [];
        const totalSupply = await estate.totalSupply();

        const allEstatesIds = Array.from(
          { length: totalSupply.toNumber() },
          (v, k) => k + 1
        );

        for (let id of allEstatesIds) {
          const order = await getEstateSellOrder(marketplace, estate, id);
          orders.push(order);
        }

        expect(orders[0].price.toString()).to.equal(ONE.toString());
        expect(orders[0].estateName).to.equal("cool estate 0x1");
      });

      it("should get an estate info (without wallet)", async () => {
        const estateId = 5;
        const order = await getEstateSellOrder(marketplace, estate, estateId);

        expect(order.estateName).to.equal("cool estate 0x5");
      });

      it("should buy an estate", async () => {
        await manaFaucetTo(ephemeral, TEN);
        await etherFaucetTo(ephemeral, ONE);

        mana.setWallet(ephemeral);
        const marketplaceApproval = mana.approve(
          marketplace.getAddress(),
          ONE.toString()
        );
        await marketplaceApproval.waitForNonceToUpdate();

        const assetId = 1;
        const priceInWei = ONE.toString();

        marketplace.setWallet(ephemeral);
        const executeOrder = marketplace.executeOrder(
          estate.getAddress(),
          assetId,
          priceInWei,
          gasParams
        );
        await executeOrder.waitForNonceToUpdate();

        await confirmBalances(estate, [ephemeral.address], [1]);
      });
    });
  });
});
