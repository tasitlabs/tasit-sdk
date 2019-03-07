// This script will add land parcels, estates and sell orders to the Decentraland marketplace
// This data is being used to test the Decentraland demo app using the ganache-cli local blockchain

import {
  //gasParams,
  duration,
  createParcels,
  createEstatesFromParcels,
  getEstateSellOrder,
} from "../testHelpers/helpers";

const { ONE, TEN } = constants;

import { Action } from "../TasitSdk";
const {
  ConfigLoader,
  ERC20,
  ERC721,
  Marketplace: MarketplaceContracts,
} = Action;
const { Mana } = ERC20;
const { Estate, Land } = ERC721;
const { Decentraland } = MarketplaceContracts;

import TasitContracts from "../../../tasit-contracts/dist";
const { local } = TasitContracts;
const { MANAToken, LANDProxy, EstateRegistry, Marketplace } = local;
const { address: LAND_PROXY_ADDRESS } = LANDProxy;
const { address: ESTATE_ADDRESS } = EstateRegistry;
const { address: MARKETPLACE_ADDRESS } = Marketplace;

// It's likely that script won't be necessary after 0.1.0 version of tasit demo app
// Use npx babel-node to run this
(async () => {
  ConfigLoader.setConfig(developmentConfig);

  const [ownerWallet, sellerWallet] = accounts;

  const landContract = new Land(LAND_PROXY_ADDRESS, ownerWallet);
  const estateContract = new Estate(ESTATE_ADDRESS, ownerWallet);
  const marketplaceContract = new Decentraland(
    MARKETPLACE_ADDRESS,
    ownerWallet
  );

  const parcels = [
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 0, y: 3 },
    { x: 0, y: 4 },
    { x: 0, y: 5 },
  ];

  // Note: Often estates have more than one parcel of land in them
  // but here we just have one parcel of land in each to keep this test short
  const estateIds = await createEstatesFromParcels(
    estateContract,
    landContract,
    parcels,
    sellerWallet
  );

  estateContract.setWallet(sellerWallet);
  const marketplaceApprovalBySeller = estateContract.setApprovalForAll(
    marketplaceContract.getAddress(),
    true,
    gasParams
  );
  await marketplaceApprovalBySeller.waitForNonceToUpdate();

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
})();
