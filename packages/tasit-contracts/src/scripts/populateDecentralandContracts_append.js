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

  for (let parcel of parcels) {
    const { x, y } = parcel;
    console.log(`creating parcel ${x},${y}....`);
    const assignAction = landContract.assignNewParcel(
      `${x}`,
      `${y}`,
      beneficiaryAddress,
      gasParams
    );

    await assignAction.waitForNonceToUpdate();
  }

  // const assignAction = landContract.assignMultipleParcels(
  //   xArray,
  //   yArray,
  //   beneficiaryAddress,
  //   gasParams
  // );
  // await assignAction.waitForNonceToUpdate();
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

const getAlreadyCreatedUniqueParcels = () => {
  const parcels = [
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

  return parcels;
};

const getAlreadyCreatedParcels = () => {
  const uniqueParcels = getAlreadyCreatedUniqueParcels();
  const estates = getAlreadyCreatedEstates();

  let estatesParcels = [];

  estates.forEach(
    estate => (estatesParcels = [...estatesParcels, ...estate.parcels])
  );

  return [...estatesParcels, ...uniqueParcels];
};

const getAlreadyCreatedEstates = () => {
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

  return estates;
};

const getParcelsFromAPI = async () => {
  const res = await fetch(
    "https://api.decentraland.org/v1/parcels?status=open&limit=50"
  );
  const json = await res.json();
  const { data: jsonData } = json;
  const { parcels: parcelsFromAPI } = jsonData;

  const parcels = parcelsFromAPI.map(parcel => {
    const { x, y, data } = parcel;
    let { name: metadata } = data;
    if (!metadata) metadata = "";
    return { x, y, metadata };
  });

  // Note: Since the current test net contract was populated with the assets, this check is necessary.
  const createdParcels = getAlreadyCreatedParcels();
  const withoutDuplicates = parcels.filter(
    fromAPI => !createdParcels.find(p => p.x == fromAPI.x && p.y == fromAPI.y)
  );

  return withoutDuplicates;
};

const parcelsAreEqual = (p1, p2) => p1.x === p2.x && p1.y === p2.y;

const findParcel = (parcel, listOfParcels) => {
  return listOfParcels.find(p => parcelsAreEqual(p, parcel));
};

// Tech-debt: Move to a functional approach
const estatesWithConflict = (estate1, estate2) => {
  const { parcels: parcels1 } = estate1;
  const { parcels: parcels2 } = estate2;
  for (let p1 of parcels1) {
    for (let p2 of parcels2) {
      if (parcelsAreEqual(p1, p2)) return true;
    }
  }

  return false;
};

const estateContainsParcelFromList = (estate, listOfParcels) => {
  const { parcels: estateParcels } = estate;

  for (let parcel of estateParcels)
    if (findParcel(parcel, listOfParcels)) return true;

  return false;
};

const getEstatesFromAPI = async () => {
  const res = await fetch(
    "https://api.decentraland.org/v1/estates?status=open&limit=50"
  );
  const json = await res.json();
  const { data: jsonData } = json;
  const { estates: estatesFromAPI } = jsonData;

  let estates = estatesFromAPI.map(estate => {
    const { data } = estate;
    const { name: metadata, parcels } = data;
    return { metadata, parcels };
  });

  const createdParcels = getAlreadyCreatedParcels();
  estates = estates.filter(
    estate => !estateContainsParcelFromList(estate, createdParcels)
  );

  const createdEstates = getAlreadyCreatedEstates();
  let withoutDuplicates = [];
  for (let e1 of estates) {
    for (let e2 of createdEstates)
      if (!estatesWithConflict(e1, e2)) {
        withoutDuplicates = [...withoutDuplicates, e1];
        break;
      }
  }

  return withoutDuplicates.filter(e => e.parcels.length < 10);
  //return [];
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

  const parcelsFromAPI = await getParcelsFromAPI();
  const estatesFromAPI = await getEstatesFromAPI();

  let parcelsToCreate = [...parcelsFromAPI];
  //let estatesToCreate = [];
  let allEstates = [...estatesFromAPI];

  // Extract parcels from estates
  estatesFromAPI.forEach(estate => {
    const { parcels } = estate;
    const withoutDup = parcels.filter(p => !findParcel(p, parcelsFromAPI));
    parcelsToCreate = [...parcelsToCreate, ...withoutDup];
  });

  // const alreadyCreatedEstates = getAlreadyCreatedEstates();
  // let alreadyCreatedParcels = getAlreadyCreatedParcels();
  //
  // alreadyCreatedEstates.forEach(
  //   estate =>
  //     (alreadyCreatedParcels = [...alreadyCreatedParcels, ...estate.parcels])
  // );
  // const createdParcels = getAlreadyCreatedParcels();
  // console.log(`createdParcels: ${createdParcels.length}`);
  // createdParcels.forEach(p => console.log(`${p.x}, ${p.y}`));
  // console.log("-----------------------------------------------");
  // console.log(`parcelsToCreate: ${parcelsToCreate.length}`);
  // parcelsToCreate.forEach(p => console.log(`${p.x}, ${p.y}`));

  //  return;
  //console.log(`estatesFromAPI: ${estatesFromAPI.length}`);

  // let newParcels = await getParcels();
  // const newEstates = await getEstates();
  // console.log(`newEstates: ${newEstates.length}`);
  // console.log(`newParcels: ${newParcels.length}`);

  // newEstates.forEach(
  //   estate => (newParcels = [...newParcels, ...estate.parcels])
  // );
  //
  //
  //
  // const estateContainsParcelFromList = (estate, listOfParcels) => {
  //   const { parcels: estateParcels } = estate;
  //   for (let parcel of estateParcels)
  //     if (findParcel(parcel, listOfParcels)) return true;
  //
  //   return false;
  // };
  //
  // const parcelsToCreate = newParcels.filter(
  //   parcel => !findParcel(parcel, alreadyCreatedParcels)
  // );
  //
  // const estatesToCreate = newEstates.filter(
  //   estate =>
  //     !estateContainsParcelFromList(estate, [
  //       ...alreadyCreatedParcels,
  //       ...parcelsToCreate,
  //     ])
  // );

  try {
    console.log("Creating parcels...");
    await createMultipleParcels(
      landContract,
      parcelsToCreate,
      sellerAddress,
      minterWallet
    );

    const allParcelsIds = parcelsToCreate.map(async parcel => {
      const { x, y } = parcel;
      return landContract.encodeTokenId(x, y);
    });

    await Promise.all(allParcelsIds);

    // Update parcels with metadata
    console.log("Updating parcels with metadata...");
    landContract.setWallet(sellerWallet);
    for (let parcel of parcelsToCreate) {
      let { x, y, metadata: parcelName } = parcel;
      console.log(`updating parcel ${x},${y}....`);
      if (!parcelName) parcelName = "";
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
