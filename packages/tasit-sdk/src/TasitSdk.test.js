import { Account, Action } from "./TasitSdk";
const { Contract, ERC721, ConfigLoader } = Action;
const { NFT } = ERC721;
import { expect, assert } from "chai";
import config from "./config/default";

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
  setupWallets,
  duration,
  createEstatesFromParcels,
  getEstateSellOrder,
} from "./testHelpers/helpers";

// in weis
const ONE = 1e18;
const TEN = 10e18;

// Note: Extract Decentraland test cases to a specific test suite when other
// use cases will be tested.
describe("Decentraland", () => {
  let ownerWallet;
  let sellerWallet;
  let buyerWallet;
  let ephemeralWallet;
  let manaContract;
  let landContract;
  let estateContract;
  let marketplaceContract;
  let snapshotId;
  let provider;
  let estateIds;

  const manaFaucetTo = async (beneficiary, amountInWei) => {
    manaContract.setWallet(ownerWallet);
    const mintManaToBuyer = manaContract.mint(
      beneficiary.address,
      amountInWei.toString()
    );
    await mintManaToBuyer.waitForNonceToUpdate();
    await confirmBalances(manaContract, [beneficiary.address], [amountInWei]);
  };

  const etherFaucetTo = async (beneficiary, amountInWei) => {
    const connectedOwnerWallet = ownerWallet.connect(provider);
    const tx = await connectedOwnerWallet.sendTransaction({
      // ethers.utils.parseEther("1.0")
      value: "0x0de0b6b3a7640000",
      to: beneficiary.address,
    });
    await provider.waitForTransaction(tx.hash);
  };

  before("", async () => {
    ConfigLoader.setConfig(config);

    provider = ProviderFactory.getProvider();

    ({
      ownerWallet,
      sellerWallet,
      buyerWallet,
      ephemeralWallet,
    } = setupWallets());

    expect(ownerWallet.address).to.have.lengthOf(42);
    expect(sellerWallet.address).to.have.lengthOf(42);
    expect(buyerWallet.address).to.have.lengthOf(42);
    expect(ephemeralWallet.address).to.have.lengthOf(42);
  });

  beforeEach("", async () => {
    snapshotId = await createSnapshot(provider);

    // Note: In future we can have other ERC20 than Mana to test the Marketplace orders
    ({
      manaContract,
      landContract,
      estateContract,
      marketplaceContract,
    } = await setupContracts(ownerWallet));

    const parcels = [
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 0, y: 5 },
    ];

    // Note: Often estates have more than one parcel of land in them
    // but here we just have one parcel of land in each to keep this test short
    estateIds = await createEstatesFromParcels(
      estateContract,
      landContract,
      parcels,
      sellerWallet
    );

    const estateData = await estateContract.getMetadata(estateIds[0]);
    expect(estateData).to.equal(`cool estate ${parcels[0].x}x${parcels[0].y}`);

    const totalSupply = await landContract.totalSupply();
    expect(totalSupply.toNumber()).to.equal(parcels.length);

    // After became part of an estate, parcels are no more accounted as LAND balance
    await confirmBalances(landContract, [sellerWallet.address], [0]);

    await confirmBalances(
      estateContract,
      [sellerWallet.address],
      [estateIds.length]
    );

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
        manaFaucetTo(buyerWallet, TEN);

        manaContract.setWallet(buyerWallet);
        const marketplaceApprovalByBuyer = manaContract.approve(
          marketplaceContract.getAddress(),
          ONE.toString()
        );
        await marketplaceApprovalByBuyer.waitForNonceToUpdate();

        estateContract.setWallet(sellerWallet);
        const marketplaceApprovalBySeller = estateContract.setApprovalForAll(
          marketplaceContract.getAddress(),
          true,
          gasParams
        );
        await marketplaceApprovalBySeller.waitForNonceToUpdate();
      }
    );

    it("should execute an order", async () => {
      await confirmBalances(
        estateContract,
        [buyerWallet.address, sellerWallet.address],
        [0, estateIds.length]
      );

      const assetId = 1;
      const priceInWei = ONE.toString();
      const expireAt = Date.now() + duration.hours(1);

      marketplaceContract.setWallet(sellerWallet);
      const createOrder = marketplaceContract.createOrder(
        estateContract.getAddress(),
        assetId,
        priceInWei,
        expireAt,
        gasParams
      );
      await createOrder.waitForNonceToUpdate();

      marketplaceContract.setWallet(buyerWallet);
      const fingerprint = await estateContract.getFingerprint(assetId);
      const executeOrder = marketplaceContract.safeExecuteOrder(
        estateContract.getAddress(),
        assetId,
        priceInWei,
        fingerprint.toString(),
        gasParams
      );
      await executeOrder.waitForNonceToUpdate();

      await confirmBalances(
        estateContract,
        [buyerWallet.address, sellerWallet.address],
        [1, estateIds.length - 1]
      );
    });

    describe("Decentraland tasit app test cases", () => {
      beforeEach(
        "create sell orders and remove wallets from contracts",
        async () => {
          marketplaceContract.setWallet(sellerWallet);
          for (let assetId of estateIds) {
            const priceInWei = ONE.toString();
            const expireAt = Date.now() + duration.years(1);
            const createOrder = marketplaceContract.createOrder(
              estateContract.getAddress(),
              assetId,
              priceInWei,
              expireAt,
              gasParams
            );
            await createOrder.waitForNonceToUpdate();
          }

          manaContract.removeWallet();
          landContract.removeWallet();
          estateContract.removeWallet();
          marketplaceContract.removeWallet();
        }
      );

      it("should list marketplace estates sell orders (without wallet)", async () => {
        const orders = [];
        const totalSupply = await estateContract.totalSupply();

        // create an array 1..N, where N = total of estates
        const allEstatesIds = [...Array(totalSupply.toNumber())].map(
          (val, key) => key + 1
        );

        for (let estateId of allEstatesIds) {
          const order = await getEstateSellOrder(
            marketplaceContract,
            estateContract,
            estateId
          );
          orders.push(order);
        }

        expect(orders).to.not.deep.include(null);
      });

      // Note: If Decentraland were leveraging ERC721Metadata token URI's more,
      // we would have done expectations on them in this test
      it("should get an estate info (without wallet)", async () => {
        const estateId = 5;
        const order = await getEstateSellOrder(
          marketplaceContract,
          estateContract,
          estateId
        );

        expect(order.estateName).to.equal("cool estate 0x5");
        expect(order.price.toString()).to.equal(ONE.toString());
      });

      it("should buy an estate", async () => {
        await manaFaucetTo(ephemeralWallet, TEN);
        await etherFaucetTo(ephemeralWallet, ONE);

        manaContract.setWallet(ephemeralWallet);
        const marketplaceApproval = manaContract.approve(
          marketplaceContract.getAddress(),
          ONE.toString()
        );
        await marketplaceApproval.waitForNonceToUpdate();

        const assetId = 1;
        const priceInWei = ONE.toString();

        marketplaceContract.setWallet(ephemeralWallet);
        const fingerprint = await estateContract.getFingerprint(assetId);
        const executeOrder = marketplaceContract.safeExecuteOrder(
          estateContract.getAddress(),
          assetId,
          priceInWei,
          fingerprint.toString(),
          gasParams
        );
        await executeOrder.waitForNonceToUpdate();

        await confirmBalances(estateContract, [ephemeralWallet.address], [1]);
      });
    });
  });
});
