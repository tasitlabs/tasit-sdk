// Helpers
import actionHelpers from "tasit-action/dist/testHelpers/helpers";
global = Object.assign(global, actionHelpers);

import DecentralandUtils from "../helpers/DecentralandUtils";

export const duration = {
  seconds: function(val) {
    return val;
  },
  minutes: function(val) {
    return val * this.seconds(60);
  },
  hours: function(val) {
    return val * this.minutes(60);
  },
  days: function(val) {
    return val * this.hours(24);
  },
  weeks: function(val) {
    return val * this.days(7);
  },
  years: function(val) {
    return val * this.days(365);
  },
};

export const pickAssetsForSale = async () => {
  let landForSale;
  let estateForSale;

  const decentralandUtils = new DecentralandUtils();
  const { getAllAssetsForSale } = decentralandUtils;

  const openSellOrders = await getAllAssetsForSale();

  // Note: The exact amount of land isn't predictable since we are forking from the latest block
  expect(openSellOrders).to.not.be.empty;

  // Pick two open sell orders: one for a parcel of land and one for an estate
  for (let order of openSellOrders) {
    const { nftAddress, expiresAt } = order;

    const isLand = addressesAreEqual(nftAddress, LAND_PROXY_ADDRESS);
    const isEstate = addressesAreEqual(nftAddress, ESTATE_ADDRESS);

    const nowInSeconds = Date.now() / 1000;
    const expired = Number(expiresAt) < nowInSeconds;

    if (isLand && !expired) landForSale = order;
    if (isEstate && !expired) estateForSale = order;

    if (landForSale && estateForSale) break;

    if (!isLand && !isEstate)
      expect(
        false,
        "All land for sale should be an NFT that is either a parcel of land or an estate"
      ).to.equal(true);
  }

  return { landForSale, estateForSale };
};

export const checkAsset = async (
  nftContract,
  erc20Contract,
  assetForSale,
  buyerAddress
) => {
  const { assetId, nftAddress, seller, priceInWei, expiresAt } = assetForSale;

  // Asset is the same as expected
  const nftContractAddress = nftContract.getAddress();
  expect(addressesAreEqual(nftAddress, nftContractAddress)).to.be.true;

  // Sell order isn't expired
  const expiresTime = Number(expiresAt);
  const nowInSeconds = Date.now() / 1000;
  expect(nowInSeconds).to.be.below(expiresTime);

  // Buyer has enough MANA
  await expectMinimumTokenBalances(erc20Contract, [buyerAddress], [priceInWei]);

  // Marketplace is approved to transfer Estate or Parcel asset owned by the seller
  const approvedForAsset = await nftContract.getApproved(assetId);
  const approvedForAll = await nftContract.isApprovedForAll(
    seller,
    MARKETPLACE_ADDRESS
  );
  const approved =
    addressesAreEqual(approvedForAsset, MARKETPLACE_ADDRESS) || approvedForAll;
  expect(approved).to.be.true;
};

export const helpers = {
  duration,
  pickAssetsForSale,
  checkAsset,
};

export default helpers;
