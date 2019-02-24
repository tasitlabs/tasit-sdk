import { expect, assert } from "chai";

import { Account, Action } from "./TasitSdk";
const { ERC20, ERC721, Marketplace, ConfigLoader } = Action;
const { Mana } = ERC20;
const { Estate, Land } = ERC721;
const { Decentraland: DecentralandMarketplace } = Marketplace;
import config from "./config/default";

import { ropsten as ropstenAddresses } from "../../tasit-contracts/decentraland/addresses";
const {
  MarketplaceProxy: MARKETPLACE_ADDRESS,
  LANDProxy: LAND_ADDRESS,
  MANAToken: MANA_ADDRESS,
  EstateProxy: ESTATE_ADDRESS,
} = ropstenAddresses;

import {
  createSnapshot,
  revertFromSnapshot,
  confirmBalances,
  gasParams,
  setupWallets,
  addressesAreEqual,
  bigNumberify,
  etherFaucet,
  ropstenManaFaucet,
  constants,
  ProviderFactory,
  DecentralandUtils,
} from "./testHelpers/helpers";

const { ONE, TEN } = constants;

const ROPSTEN_NETWORK_ID = 3;

describe("Decentraland tasit app test cases (ropsten)", () => {
  let ownerWallet;
  let ephemeralWallet;
  let manaContract;
  let landContract;
  let estateContract;
  let marketplaceContract;
  let landForSale;
  let estateForSale;
  let snapshotId;
  let provider;

  before("", async () => {
    ConfigLoader.setConfig(config);

    provider = ProviderFactory.getProvider();

    const network = await provider.getNetwork();
    const { chainId } = network;
    expect(chainId, "The target network isn't ropsten.").to.equal(
      ROPSTEN_NETWORK_ID
    );

    manaContract = new Mana(MANA_ADDRESS);
    landContract = new Land(LAND_ADDRESS);
    estateContract = new Estate(ESTATE_ADDRESS);
    marketplaceContract = new DecentralandMarketplace(MARKETPLACE_ADDRESS);

    const decentralandUtils = new DecentralandUtils();
    const { getOpenSellOrders } = decentralandUtils;

    const fromBlock = 0;
    const openSellOrders = await getOpenSellOrders(fromBlock);

    // Note: The exact amount of land isn't predictable since we are forking from the latest block
    expect(openSellOrders).to.not.be.empty;

    // Pick two open sell orders: one for a parcel of land and one for an estate
    for (let sellOrder of openSellOrders) {
      const { values: order } = sellOrder;
      const { nftAddress, expiresAt } = order;

      const isLand = addressesAreEqual(nftAddress, LAND_ADDRESS);
      const isEstate = addressesAreEqual(nftAddress, ESTATE_ADDRESS);
      const expired = Number(expiresAt) < Date.now();

      // All parcels of land and estates for sale are expired (block 5058416) -
      // otherwise we would select one that isn't expired
      if (isLand) landForSale = order;
      if (isEstate) estateForSale = order;

      if (landForSale && estateForSale) break;

      if (!isLand && !isEstate)
        expect(
          false,
          "All land for sale should be an NFT that is either a parcel of land or an estate"
        ).to.equal(true);
    }

    expect(estateForSale).not.to.be.an("undefined");
    expect(landForSale).not.to.be.an("undefined");
  });

  beforeEach(
    "buyer approves marketplace contract to transfer tokens on their behalf",
    async () => {
      snapshotId = await createSnapshot(provider);

      ({ ownerWallet, ephemeralWallet } = setupWallets());
      expect(ownerWallet.address).to.have.lengthOf(42);
      expect(ephemeralWallet.address).to.have.lengthOf(42);

      await etherFaucet(provider, ownerWallet, ephemeralWallet.address, ONE);

      const { priceInWei: landPrice } = landForSale;
      const { priceInWei: estatePrice } = estateForSale;

      const manaAmountToShopping = bigNumberify(landPrice).add(
        bigNumberify(estatePrice)
      );

      await confirmBalances(manaContract, [ephemeralWallet.address], [0]);
      await ropstenManaFaucet(
        provider,
        ownerWallet,
        ephemeralWallet,
        manaAmountToShopping
      );
      await confirmBalances(
        manaContract,
        [ephemeralWallet.address],
        [manaAmountToShopping]
      );

      manaContract.setWallet(ephemeralWallet);
      const approvalAction = manaContract.approve(
        MARKETPLACE_ADDRESS,
        manaAmountToShopping,
        gasParams
      );
      await approvalAction.waitForNonceToUpdate();

      const allowance = await manaContract.allowance(
        ephemeralWallet.address,
        MARKETPLACE_ADDRESS
      );

      expect(`${allowance}`).to.equal(`${manaAmountToShopping}`);
    }
  );

  afterEach("", async () => {
    await revertFromSnapshot(provider, snapshotId);
  });

  describe("read-only / without wallet test cases", async () => {
    it("should get land for sale info", async () => {
      const { assetId } = landForSale;

      const metadataPromise = landContract.tokenMetadata(assetId);
      const coordsPromise = landContract.decodeTokenId(assetId);
      const [metadata, coords] = await Promise.all([
        metadataPromise,
        coordsPromise,
      ]);

      // Note: Metadata could be an empty string
      expect(metadata).to.not.be.null;
      if (metadata === "")
        console.log(`Land parcel id ${assetId} with empty metadata.`);

      const [x, y] = coords;
      expect(coords).to.not.include(null);
      expect(x.toNumber()).to.be.a("number");
      expect(y.toNumber()).to.be.a("number");
    });

    it("should get info about the estate for sale", async () => {
      const { assetId } = estateForSale;

      const metadataPromise = estateContract.getMetadata(assetId);
      const sizePromise = estateContract.getEstateSize(assetId);
      const [metadata, size] = await Promise.all([
        metadataPromise,
        sizePromise,
      ]);

      // Note: Metadata could be an empty string
      expect(metadata).to.not.be.null;
      if (metadata === "")
        console.log(`Estate id ${assetId} with empty metadata.`);

      expect(size.toNumber()).to.be.a("number");
      expect(size.toNumber()).to.be.at.least(0);
    });
  });

  describe("write operations / with wallet test cases", async () => {
    // Note: This test case isn't working. The transaction is being reverted and the reason isn't known yet
    it.skip("should buy an estate", async () => {
      const {
        assetId,
        nftAddress,
        seller,
        priceInWei,
        expiresAt,
      } = estateForSale;

      const { address: ephemeralAddress } = ephemeralWallet;

      const expiresTime = Number(expiresAt);
      expect(Date.now()).to.be.below(expiresTime);

      const priceInWeiBN = bigNumberify(priceInWei);

      // Buyer (ephemeral wallet) has enough MANA
      const manaBalance = await manaContract.balanceOf(ephemeralAddress);
      const manaBalanceBN = bigNumberify(manaBalance);
      expect(manaBalanceBN.gt(priceInWeiBN)).to.be.true;

      // Marketplace is approved to transfer Estate asset owned by the seller
      const approvedForAsset = await estateContract.getApproved(assetId);
      const approvedForAll = await estateContract.isApprovedForAll(
        seller,
        MARKETPLACE_ADDRESS
      );
      const approved =
        addressesAreEqual(approvedForAsset, MARKETPLACE_ADDRESS) ||
        approvedForAll;
      expect(approved).to.be.true;

      await confirmBalances(estateContract, [ephemeralWallet.address], [0]);

      const fingerprint = await estateContract.getFingerprint(
        assetId.toString()
      );
      marketplaceContract.setWallet(ephemeralWallet);
      const executeOrderAction = marketplaceContract.safeExecuteOrder(
        nftAddress,
        `${assetId}`,
        `${priceInWei}`,
        `${fingerprint}`,
        gasParams
      );

      await executeOrderAction.waitForNonceToUpdate();

      await confirmBalances(estateContract, [ephemeralWallet.address], [1]);
    });

    // All land sell orders are expired
    it.skip("should buy a parcel of land", async () => {});
  });
});
