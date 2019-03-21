// This script will add land parcels, estates and sell orders to the Decentraland marketplace
// This data is being used to test the Decentraland demo app
import fetch from "node-fetch";
import TasitAction from "../../../tasit-action/dist/";
const {
  ConfigLoader,
  ERC20,
  ERC721,
  Marketplace: MarketplaceContracts,
} = TasitAction;
const { Mana } = ERC20;
const { Estate, Land } = ERC721;
const { Decentraland } = MarketplaceContracts;

import ProviderFactory from "../../../tasit-action/dist/ProviderFactory";

import TasitContractBasedAccount from "../../../tasit-contract-based-account/dist/";
const { GnosisSafe } = TasitContractBasedAccount;

import TasitContracts from "..";

import fs from "fs";

import { duration } from "../../../tasit-sdk/dist/testHelpers/helpers";

const { ONE, TEN, ONE_HUNDRED, ONE_THOUSAND, BILLION, WeiPerEther } = constants;

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
  marketplaceAddress,
  landContract,
  estateContract,
  assetsOwnerWallet
) => {
  // Set false to remove approval
  const authorized = true;

  estateContract.setWallet(assetsOwnerWallet);
  const estateApproval = estateContract.setApprovalForAll(
    marketplaceAddress,
    authorized,
    gasParams
  );
  await estateApproval.waitForNonceToUpdate();

  landContract.setWallet(assetsOwnerWallet);
  const landApproval = landContract.setApprovalForAll(
    marketplaceAddress,
    authorized,
    gasParams
  );
  await landApproval.waitForNonceToUpdate();
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

const placeEstatesSellOrders = async (
  marketplace,
  estateAddress,
  estateIds,
  expireAt,
  sellerWallet
) => {
  const price = getRandomInt(10, 100) + "000";
  const priceInWei = bigNumberify(price).mul(WeiPerEther);

  marketplace.setWallet(sellerWallet);
  for (let assetId of estateIds) {
    const action = marketplace.createOrder(
      estateAddress,
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
  landAddress,
  landIds,
  expireAt,
  sellerWallet
) => {
  const price = getRandomInt(10, 100) + "000";
  const priceInWei = bigNumberify(price).mul(WeiPerEther);

  marketplace.setWallet(sellerWallet);
  for (let assetId of landIds) {
    const action = marketplace.createOrder(
      landAddress,
      assetId,
      priceInWei,
      expireAt,
      gasParams
    );
    await action.waitForNonceToUpdate();
  }
};

let network = process.env.NETWORK;

const getParcels = async () => {
  let parcels = [
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

  const res = await fetch(
    "https://api.decentraland.org/v1/parcels?status=open&limit=50"
  );
  const json = await res.json();
  const { data: jsonData } = json;
  const { parcels: parcelsFromAPI } = jsonData;

  // Note: Since the current test net contract was populated with the assets above,
  // this check is necessary. From a new deployment we should keep on this function
  // assets only from Decentraland API
  const withoutDuplicates = parcelsFromAPI.filter(
    fromAPI => !parcels.find(p => p.x == fromAPI.x && p.y == fromAPI.y)
  );

  withoutDuplicates.map(parcel => {
    const { x, y, data } = parcel;
    const { name: metadata } = data;
    parcels = [...parcels, { x, y, metadata }];
  });

  return parcels;
};

const getEstates = async () => {
  let estates = [
    {
      metadata: `all road adjacent parcels`,
      parcels: [
        { x: -30, y: -105, metadata: `` },
        { x: -31, y: -105, metadata: `` },
        { x: -29, y: -105, metadata: `` },
        { x: -30, y: -104, metadata: `` },
        { x: -29, y: -104, metadata: `` },
      ],
    },
    {
      metadata: `Forest / university estate`,
      parcels: [{ x: 3, y: 141, metadata: `` }, { x: 2, y: 141, metadata: `` }],
    },
    {
      metadata: `Down-Town Bridge`,
      parcels: [
        { x: -39, y: 30, metadata: `` },
        { x: -39, y: 31, metadata: `` },
      ],
    },
    {
      metadata: `Decentraland University Underpass`,
      parcels: [
        { x: -47, y: 124, metadata: `` },
        { x: -48, y: 124, metadata: `` },
      ],
    },
    {
      metadata: `Estate: Villa Beau Soleil H`,
      parcels: [
        { x: 39, y: -114, metadata: `Letter N` },
        { x: 39, y: -113, metadata: `Letter "N"` },
      ],
    },
  ];

  // const res = await fetch(
  //   "https://api.decentraland.org/v1/estates?status=open&limit=50"
  // );
  // const json = await res.json();
  // const { data: jsonData } = json;
  // const { estates: estatesFromAPI } = jsonData;
  //
  // estatesFromAPI.map(estate => {
  //   const { data } = estate;
  //   const { name: metadata, parcels } = data;
  //   estates = [...estates, { metadata, parcels }];
  // });

  return estates;
};

(async () => {
  const config = require(`../config/${network}.js`);

  // https://stats.goerli.net/
  if (network === "goerli")
    gasParams = {
      gasLimit: 8e6,
      gasPrice: 1e10,
    };
  else if (network === "development") {
    network = "local";
  }
  const {
    LANDProxy,
    EstateRegistry,
    Marketplace,
    GnosisSafe: GnosisSafeInfo,
    MANAToken,
  } = TasitContracts[network];
  const { address: MANA_ADDRESS } = MANAToken;
  const { address: LAND_PROXY_ADDRESS } = LANDProxy;
  const { address: ESTATE_ADDRESS } = EstateRegistry;
  const { address: MARKETPLACE_ADDRESS } = Marketplace;
  const { address: GNOSIS_SAFE_ADDRESS } = GnosisSafeInfo;

  ConfigLoader.setConfig(config);

  const [minterWallet, sellerWallet] = accounts;
  const { address: sellerAddress } = sellerWallet;

  const manaContract = new Mana(MANA_ADDRESS);
  const landContract = new Land(LAND_PROXY_ADDRESS);
  const estateContract = new Estate(ESTATE_ADDRESS);
  const marketplaceContract = new Decentraland(MARKETPLACE_ADDRESS);
  const gnosisSafeContract = new GnosisSafe(GNOSIS_SAFE_ADDRESS);

  // Fund Gnosis Safe wallet with Mana tokens and ethers
  const provider = ProviderFactory.getProvider();
  await etherFaucet(provider, minterWallet, GNOSIS_SAFE_ADDRESS, TEN);
  await erc20Faucet(manaContract, minterWallet, GNOSIS_SAFE_ADDRESS, BILLION);

  const uniqueParcels = await getParcels();
  const allEstates = await getEstates();
  let allParcels = [];
  allEstates.forEach(
    estate => (allParcels = [...allParcels, ...estate.parcels])
  );
  allParcels = [...allParcels, ...uniqueParcels];

  try {
    console.log("Creating parcels...");
    await createMultipleParcels(
      landContract,
      allParcels,
      sellerAddress,
      minterWallet
    );

    const allParcelsIds = allParcels.map(async parcel => {
      const { x, y } = parcel;
      return landContract.encodeTokenId(x, y);
    });

    await Promise.all(allParcelsIds);

    // Update parcels with metadata
    console.log("Updating parcels with metadata...");
    landContract.setWallet(sellerWallet);
    for (let parcel of allParcels) {
      let { x, y, metadata: parcelName } = parcel;
      if (!parcelName) parcelName = "";
      console.log(`Updating ${x},${y}`);
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
    await approveMarketplace(
      MARKETPLACE_ADDRESS,
      landContract,
      estateContract,
      sellerWallet
    );

    const expireAt = Date.now() + duration.years(5);

    console.log("Placing estates sellorders...");
    await placeEstatesSellOrders(
      marketplaceContract,
      ESTATE_ADDRESS,
      allEstateIds,
      expireAt,
      sellerWallet
    );

    console.log("Placing parcels sellorders...");
    await placeParcelsSellOrders(
      marketplaceContract,
      LAND_PROXY_ADDRESS,
      allParcelsIds,
      expireAt,
      sellerWallet
    );
  } catch (err) {
    console.error(err);
  }
})();
