// Helpers
import actionHelpers from "tasit-action/dist/testHelpers/helpers";
const {
  addressesAreEqual,
  expectMinimumTokenBalances,
  ProviderFactory,
  duration,
  createSnapshot,
  revertFromSnapshot,
  mineBlocks,
  constants,
  expectMinimumEtherBalances,
  accounts,
  bigNumberify,
  etherFaucet,
  erc20Faucet,
  expectExactEtherBalances,
  expectExactTokenBalances,
} = actionHelpers;

import { Action } from "../TasitSdk";
const { ConfigLoader } = Action;
import config from "../config/default";
ConfigLoader.setConfig(config);

const provider = ProviderFactory.getProvider();

// TODO: Create a getContracts function
const { _network: network } = provider;
const networkName = !network ? "local" : network.name;
import TasitContracts from "tasit-contracts";
const { LANDProxy, EstateRegistry, Marketplace } = TasitContracts[networkName];
const { address: LAND_PROXY_ADDRESS } = LANDProxy;
const { address: ESTATE_ADDRESS } = EstateRegistry;
const { address: MARKETPLACE_ADDRESS } = Marketplace;

import DecentralandUtils from "../helpers/DecentralandUtils";

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
  ProviderFactory,
  createSnapshot,
  revertFromSnapshot,
  mineBlocks,
  constants,
  expectMinimumEtherBalances,
  expectMinimumTokenBalances,
  accounts,
  addressesAreEqual,
  bigNumberify,
  expectExactTokenBalances,
  etherFaucet,
  erc20Faucet,
  expectExactEtherBalances,
};

export default helpers;
