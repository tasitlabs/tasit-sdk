// This script will add land parcels, estates and sell orders to the Decentraland marketplace
// This data is being used to test the Decentraland demo app using the ganache-cli local blockchain
import { createFromPrivateKey } from "tasit-account/dist/testHelpers/helpers";
import {
  setupWallets,
  setupContracts,
  duration,
  createEstatesFromParcels,
  getEstateSellOrder,
  gasParams,
} from "../testHelpers/helpers";

// It's likely that script won't be necessary after 0.1.0 version of tasit demo app
// Use npx babel-node to run this
(async () => {
  const { ownerWallet, sellerWallet } = setupWallets();
  const {
    landContract,
    estateContract,
    marketplaceContract,
  } = await setupContracts(ownerWallet);

  const ONE = 1e18;

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

  const orders = [];
  for (let id of estateIds) {
    const order = await getEstateSellOrder(
      marketplaceContract,
      estateContract,
      id
    );
    orders.push(order);
  }

  console.log(orders);
})();
