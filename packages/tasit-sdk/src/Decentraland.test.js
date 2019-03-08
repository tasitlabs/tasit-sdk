import { Account, Action } from "./TasitSdk";
const { ERC20, ERC721, Marketplace: MarketplaceContracts } = Action;
const { Mana } = ERC20;
const { Estate, Land } = ERC721;
const { Decentraland } = MarketplaceContracts;
import TasitContracts from "../../tasit-contracts/dist";
const { local } = TasitContracts;
const { MANAToken, LANDProxy, EstateRegistry, Marketplace } = local;
const { address: MANA_ADDRESS } = MANAToken;
const { address: LAND_PROXY_ADDRESS } = LANDProxy;
const { address: ESTATE_ADDRESS } = EstateRegistry;
const { address: MARKETPLACE_ADDRESS } = Marketplace;

const { ONE, TEN } = constants;

import DecentralandUtils from "./helpers/DecentralandUtils";

describe("Decentraland", () => {
  let ownerWallet;
  let sellerWallet;
  let buyerWallet;
  let ephemeralWallet;
  let manaContract;
  let landContract;
  let estateContract;
  let marketplaceContract;
  let landForSale;
  let estateForSale;

  // TODO: Assign different contract objects for each wallet (avoiding setWallet)
  before("", async () => {
    [ownerWallet, sellerWallet, buyerWallet] = accounts;
    ephemeralWallet = Account.create();

    // Note: In future we can have other ERC20 than Mana to test the Marketplace orders
    manaContract = new Mana(MANA_ADDRESS);
    landContract = new Land(LAND_PROXY_ADDRESS);
    estateContract = new Estate(ESTATE_ADDRESS);
    marketplaceContract = new Decentraland(MARKETPLACE_ADDRESS);

    // Move getting open orders code to testHelpers
    const decentralandUtils = new DecentralandUtils();
    const { getOpenSellOrders } = decentralandUtils;

    const fromBlock = 0;
    const openSellOrders = await getOpenSellOrders(fromBlock);

    console.log(openSellOrders.length);

    // Note: The exact amount of land isn't predictable since we are forking from the latest block
    expect(openSellOrders).to.not.be.empty;

    // Pick two open sell orders: one for a parcel of land and one for an estate
    for (let sellOrder of openSellOrders) {
      const { values: order } = sellOrder;
      const { nftAddress, expiresAt } = order;

      const isLand = addressesAreEqual(nftAddress, LAND_PROXY_ADDRESS);
      const isEstate = addressesAreEqual(nftAddress, ESTATE_ADDRESS);
      const expired = Number(expiresAt) < Date.now();

      // All parcels of land and estates for sale are expired (block 5058416) -
      // otherwise we would select one that isn't expired
      if (isLand && !expired) landForSale = order;
      if (isEstate && !expired) estateForSale = order;

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

  beforeEach("", async () => {
    const { address: ephemeralAddress } = ephemeralWallet;

    await etherFaucet(provider, ownerWallet, ephemeralAddress, ONE);

    await confirmBalances(manaContract, [ephemeralAddress], [0]);

    await confirmBalances(landContract, [ephemeralAddress], [0]);
    await confirmBalances(estateContract, [ephemeralAddress], [0]);

    manaContract.removeWallet();
    landContract.removeWallet();
    estateContract.removeWallet();
    marketplaceContract.removeWallet();
  });

  describe("Marketplace", () => {
    beforeEach(
      "buyer and seller approve marketplace contract to transfer tokens on their behalf",
      async () => {
        const { address: ephemeralAddress } = ephemeralWallet;

        const { priceInWei: landPrice } = landForSale;
        const { priceInWei: estatePrice } = estateForSale;

        const manaAmountForShopping = bigNumberify(landPrice).add(
          bigNumberify(estatePrice)
        );

        await erc20Faucet(
          manaContract,
          ownerWallet,
          ephemeralAddress,
          manaAmountForShopping
        );

        await confirmBalances(
          manaContract,
          [ephemeralAddress],
          [manaAmountForShopping]
        );

        manaContract.setWallet(ephemeralWallet);
        const approvalAction = manaContract.approve(
          MARKETPLACE_ADDRESS,
          manaAmountForShopping,
          gasParams
        );
        await approvalAction.waitForNonceToUpdate();

        const allowance = await manaContract.allowance(
          ephemeralAddress,
          MARKETPLACE_ADDRESS
        );

        expect(`${allowance}`).to.equal(`${manaAmountForShopping}`);
      }
    );

    describe("read-only / without wallet test cases", () => {
      // Note: If Decentraland were leveraging ERC721Metadata token URI's more,
      // we would have done expectations on them in this test
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

      // Note: If Decentraland were leveraging ERC721Metadata token URI's more,
      // we would have done expectations on them in this test
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

      it("should buy an estate", async () => {
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
        expect(manaBalanceBN.gte(priceInWeiBN)).to.be.true;

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

        await confirmBalances(estateContract, [ephemeralAddress], [0]);

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

        await confirmBalances(estateContract, [ephemeralAddress], [1]);
      });

      it("should buy a parcel of land", async () => {
        const {
          assetId,
          nftAddress,
          seller,
          priceInWei,
          expiresAt,
        } = landForSale;

        const { address: ephemeralAddress } = ephemeralWallet;

        const expiresTime = Number(expiresAt);
        expect(Date.now()).to.be.below(expiresTime);

        const priceInWeiBN = bigNumberify(priceInWei);

        // Buyer (ephemeral wallet) has enough MANA
        const manaBalance = await manaContract.balanceOf(ephemeralAddress);
        const manaBalanceBN = bigNumberify(manaBalance);
        expect(manaBalanceBN.gte(priceInWeiBN)).to.be.true;

        // Marketplace is approved to transfer Land Parcel asset owned by the seller
        const approvedForAsset = await landContract.getApproved(assetId);
        const approvedForAll = await landContract.isApprovedForAll(
          seller,
          MARKETPLACE_ADDRESS
        );
        const approved =
          addressesAreEqual(approvedForAsset, MARKETPLACE_ADDRESS) ||
          approvedForAll;
        expect(approved).to.be.true;

        await confirmBalances(landContract, [ephemeralAddress], [0]);

        // LANDRegistry contract doesn't implement getFingerprint function
        const fingerprint = "0x";
        marketplaceContract.setWallet(ephemeralWallet);
        const executeOrderAction = marketplaceContract.safeExecuteOrder(
          nftAddress,
          `${assetId}`,
          `${priceInWei}`,
          `${fingerprint}`,
          gasParams
        );

        await executeOrderAction.waitForNonceToUpdate();

        await confirmBalances(landContract, [ephemeralAddress], [1]);
      });
    });
  });
});
