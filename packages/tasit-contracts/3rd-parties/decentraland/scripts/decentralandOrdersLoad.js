// This script will add land parcels, estates and sell orders to the Decentraland marketplace
// This data is being used to test the Decentraland demo app

import TasitAction from "../../../../tasit-action/dist/";
const {
  ConfigLoader,
  ERC20,
  ERC721,
  Marketplace: MarketplaceContracts,
} = TasitAction;
const { Mana } = ERC20;
const { Estate, Land } = ERC721;
const { Decentraland } = MarketplaceContracts;

import config from "./config/default.js";
const { provider } = config;
const { network } = provider;

// https://stats.goerli.net/
if (network === "goerli")
  gasParams = {
    gasLimit: 8e6,
    gasPrice: 1e10,
  };

import TasitContracts from "../../../dist";
const { local, goerli } = TasitContracts;
const blockchain = network === "goerli" ? goerli : local;
const { MANAToken, LANDProxy, EstateRegistry, Marketplace } = blockchain;
const { address: LAND_PROXY_ADDRESS } = LANDProxy;
const { address: ESTATE_ADDRESS } = EstateRegistry;
const { address: MARKETPLACE_ADDRESS } = Marketplace;

import { duration } from "../../../../tasit-sdk/dist/testHelpers/helpers";
const { ONE, TEN } = constants;

const createMultipleParcels = async (
  landContract,
  parcels,
  beneficiaryAddress,
  contractOwnerWallet
) => {
  let xArray = [];
  let yArray = [];

  parcels.forEach(parcel => {
    xArray.push(parcel.x);
    yArray.push(parcel.y);
  });

  landContract.setWallet(contractOwnerWallet);
  const assignAction = landContract.assignMultipleParcels(
    xArray,
    yArray,
    beneficiaryAddress,
    gasParams
  );
  await assignAction.waitForNonceToUpdate();
};

const createEstate = async (estateContract, landContract, estate, wallet) => {
  const { metadata: estateName, parcels } = estate;
  const { address: beneficiaryAddress } = wallet;

  let xArray = [];
  let yArray = [];

  parcels.forEach(parcel => {
    xArray.push(parcel.x);
    yArray.push(parcel.y);
  });

  console.log(`creating estate.... ${xArray} - ${yArray}`);

  landContract.setWallet(wallet);
  const action = landContract.createEstateWithMetadata(
    xArray,
    yArray,
    beneficiaryAddress,
    estateName,
    gasParams
  );

  const estateId = await new Promise((resolve, reject) => {
    estateContract.once("CreateEstate", message => {
      const { data } = message;
      const { args } = data;
      resolve(args._estateId);
    });
  });

  await action.waitForNonceToUpdate();
  console.log("created id =", estateId);

  return estateId;
};

const createEstates = async (estateContract, landContract, estates, wallet) => {
  const estateIds = [];
  for (let estate of estates) {
    const id = await createEstate(estateContract, landContract, estate, wallet);
    estateIds.push(id);
  }
  return estateIds;
};

const approveMarketplace = async (
  landContract,
  estateContract,
  assetsOwnerWallet
) => {
  estateContract.setWallet(assetsOwnerWallet);
  const estateApproval = estateContract.setApprovalForAll(
    MARKETPLACE_ADDRESS,
    true,
    gasParams
  );
  await estateApproval.waitForNonceToUpdate();

  landContract.setWallet(assetsOwnerWallet);
  const landApproval = landContract.setApprovalForAll(
    MARKETPLACE_ADDRESS,
    true,
    gasParams
  );
  await landApproval.waitForNonceToUpdate();
};

const placeEstatesSellOrders = async (
  marketplace,
  estatesIds,
  priceInWei,
  expireAt,
  sellerWallet
) => {
  marketplace.setWallet(sellerWallet);
  for (let assetId of estatesIds) {
    const action = marketplace.createOrder(
      ESTATE_ADDRESS,
      assetId,
      priceInWei,
      expireAt,
      gasParams
    );
    await action.waitForNonceToUpdate();
  }
};

const placeParcelsSellOrders = async (
  marketplace,
  landsIds,
  priceInWei,
  expireAt,
  sellerWallet
) => {
  marketplace.setWallet(sellerWallet);
  for (let assetId of landsIds) {
    const action = marketplace.createOrder(
      LAND_PROXY_ADDRESS,
      assetId,
      priceInWei,
      expireAt,
      gasParams
    );
    await action.waitForNonceToUpdate();
  }
};

(async () => {
  ConfigLoader.setConfig(config);

  const [ownerWallet, sellerWallet] = accounts;
  const { address: sellerAddress } = sellerWallet;

  const landContract = new Land(LAND_PROXY_ADDRESS);
  const estateContract = new Estate(ESTATE_ADDRESS);
  const marketplaceContract = new Decentraland(MARKETPLACE_ADDRESS);

  const allParcels = [
    // Estate: all road adjacent parcels
    { x: -30, y: -105, metadata: `` },
    { x: -31, y: -105, metadata: `` },
    { x: -29, y: -105, metadata: `` },
    { x: -30, y: -104, metadata: `` },
    { x: -29, y: -104, metadata: `` },

    // Estate: Forest / university estate
    { x: 3, y: 141, metadata: `` },
    { x: 2, y: 141, metadata: `` },

    // Estate: Down-Town Bridge
    { x: -39, y: 30, metadata: `` },
    { x: -39, y: 31, metadata: `` },

    // Estate: Decentraland University Underpass
    { x: -47, y: 124, metadata: `` },
    { x: -48, y: 124, metadata: `` },

    // Estate: Villa Beau Soleil H
    { x: 39, y: -114, metadata: `Letter N` },
    { x: 39, y: -113, metadata: `Letter "N"` },

    // Unique parcels
    { x: -20, y: 36, metadata: `Premium Downtown,road adjacent,central area.` },
    { x: -61, y: 125, metadata: `Vegas/Univeristy` },
    { x: 141, y: -122, metadata: `dePeets Place 6` },
    { x: -150, y: 22, metadata: `Fashion District X` },
    { x: -150, y: 23, metadata: `District X Fashion Sandwich` },
    {
      x: -7,
      y: -110,
      metadata: `On a junction right opposite two large estates :O)`,
    },
  ];

  // Note: Often estates have more than one parcel of land in them
  // but here we just have one parcel of land in each to keep this test short
  const allEstates = [
    {
      metadata: `all road adjacent parcels`,
      parcels: allParcels.slice(0, 5),
    },
    {
      metadata: `Forest / university estate`,
      parcels: allParcels.slice(5, 7),
    },
    {
      metadata: `Down-Town Bridge`,
      parcels: allParcels.slice(7, 9),
    },
    {
      metadata: `Decentraland University Underpass`,
      parcels: allParcels.slice(9, 11),
    },
    {
      metadata: `Estate: Villa Beau Soleil H`,
      parcels: allParcels.slice(11, 13),
    },
  ];

  console.log("Creating parcels...");
  await createMultipleParcels(
    landContract,
    allParcels,
    sellerAddress,
    ownerWallet
  );

  const allParcelsIds = allParcels.map(async parcel => {
    const { x, y } = parcel;
    return await landContract.encodeTokenId(x, y);
  });

  // Update parcels with metadata
  console.log("Updating parcels with metadata...");
  landContract.setWallet(sellerWallet);
  for (let parcel of allParcels) {
    const { x, y, metadata: parcelName } = parcel;
    const updateAction = landContract.updateLandData(x, y, parcelName);
    await updateAction.waitForNonceToUpdate();
  }

  console.log("Creating estates...");
  const allEstateIds = await createEstates(
    estateContract,
    landContract,
    allEstates,
    sellerWallet
  );

  console.log("Approving Marketplace...");
  await approveMarketplace(landContract, estateContract, sellerWallet);

  const priceInWei = `${ONE}`;
  const expireAt = Date.now() + duration.years(5);

  console.log("Placing estates sellorders...");
  await placeEstatesSellOrders(
    marketplaceContract,
    allEstateIds,
    priceInWei,
    expireAt,
    sellerWallet
  );

  // All unique parcels
  const landsIdsToSell = allParcelsIds.slice(13, 19);

  console.log("Placing parcels sellorders...");
  await placeParcelsSellOrders(
    marketplaceContract,
    landsIdsToSell,
    priceInWei,
    expireAt,
    sellerWallet
  );
})();
