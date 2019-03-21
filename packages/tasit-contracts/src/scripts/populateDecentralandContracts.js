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

let network = process.env.NETWORK;

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

const provider = ProviderFactory.getProvider();

(async () => {
  try {
    // Fund Gnosis Safe wallet with Mana tokens and ethers
    await etherFaucet(provider, minterWallet, GNOSIS_SAFE_ADDRESS, TEN);
    await erc20Faucet(manaContract, minterWallet, GNOSIS_SAFE_ADDRESS, BILLION);

    // Data created by hand and previously added to the contracts
    await populateDecentralandContractsWithInitialData();

    // Additional data created based on Decentraland API
    await populateDecentralandContractsWithAdditionalData();
  } catch (err) {
    console.error(err);
  }
})();

const cancelOrdersOfEstatesWithoutImage = async estatesIds => {
  const getImageDataFromEstateId = async id => {
    const image = await fetch(
      `https://api.decentraland.org/v1/estates/${id}/map.png`
    );
    const data = (await image.buffer()).toString("base64");
    return data;
  };

  // Note: Estate with 5 is one of the estates with blank image
  const blankImageData = await getImageDataFromEstateId(5);

  marketplaceContract.setWallet(sellerWallet);
  for (let id of estatesIds) {
    const imageData = await getImageDataFromEstateId(id);

    if (imageData === blankImageData) {
      console.log(
        `Removing order of estate (id: ${id}) because it's with a blank image.`
      );

      const action = marketplaceContract.cancelOrder(
        ESTATE_ADDRESS,
        `${id}`,
        gasParams
      );
      await action.waitForNonceToUpdate();
    }
  }
};

const extractParcelsFromEstates = estates => {
  let estatesParcels = [];
  estates.forEach(estate => {
    const { parcels } = estate;
    estatesParcels = [...estatesParcels, ...parcels];
  });
  return estatesParcels;
};

const populateDecentralandContractsWithAdditionalData = async () => {
  const parcelsFromAPI = await getParcelsFromAPI();
  const estatesFromAPI = await getEstatesFromAPI();

  const estatesParcels = extractParcelsFromEstates(estatesFromAPI);

  const estatesParcelsWithoutDuplication = estatesParcels.filter(
    p => !findParcel(p, parcelsFromAPI)
  );

  const parcelsToCreate = [
    ...parcelsFromAPI,
    ...estatesParcelsWithoutDuplication,
  ];

  const estatesToCreate = [...estatesFromAPI];

  await populateDecentralandContracts(parcelsToCreate, estatesToCreate);

  const alreadyCreatedEstates = getInitialEstates();
  const estatesAmount = alreadyCreatedEstates.length + estatesToCreate.length;

  // Creating an array of all estates ids
  const estatesIds = [...Array(estatesAmount).keys()].map(n => n + 1);

  await cancelOrdersOfEstatesWithoutImage(estatesIds);
};

const getAllInitialParcels = () => {
  const uniqueParcels = getInitialParcels();
  const estates = getInitialEstates();

  const estatesParcels = extractParcelsFromEstates(estates);
  const allParcels = [...estatesParcels, ...uniqueParcels];

  return allParcels;
};

const populateDecentralandContractsWithInitialData = async () => {
  const allParcels = getAllInitialParcels();
  const estates = getInitialEstates();

  await populateDecentralandContracts(allParcels, estates);
};

const populateDecentralandContracts = async (parcels, estates) => {
  const parcelIds = await createParcels(parcels);

  // const parcelIds = parcels.map(async parcel => {
  //   const { x, y } = parcel;
  //   return await landContract.encodeTokenId(x, y);
  // });

  await updateParcelsData(parcels);

  const estateIds = await createEstates(estates);

  await approveMarketplace();

  // await placeEstatesSellOrders(estateIds);
  //
  // await placeParcelsSellOrders(parcelIds);

  await placeAssesOrders(estateIds, parcelIds);
};

const updateParcelsData = async parcels => {
  console.log("Updating parcels with metadata...");

  landContract.setWallet(sellerWallet);
  for (let parcel of parcels) {
    let { x, y, metadata: parcelName } = parcel;
    if (parcelName && parcelName !== "") {
      const updateAction = landContract.updateLandData(x, y, parcelName);
      await updateAction.waitForNonceToUpdate();
    }
  }
};

const getIdsFromParcels = async parcels => {
  const parcelIds = parcels.map(parcel => {
    const { x, y } = parcel;
    return landContract.encodeTokenId(`${x}`, `${y}`);
  });

  await Promise.all(parcelIds);

  return parcelIds;
};

// Tech-debt: Use `assignMultipleParcels` to save gas cost.
// The number of parcels per call should be short enough to avoid out-of-gas.
const createParcels = async allParcels => {
  console.log("Creating parcels...");

  landContract.setWallet(minterWallet);

  for (let parcel of allParcels) {
    const { x, y } = parcel;
    const assignAction = landContract.assignNewParcel(
      `${x}`,
      `${y}`,
      sellerAddress,
      gasParams
    );
    await assignAction.waitForNonceToUpdate();
  }

  const parcelsIds = await getIdsFromParcels(allParcels);
  return parcelsIds;
};

const createEstate = async estate => {
  const { metadata: estateName, parcels } = estate;
  const { address: beneficiaryAddress } = sellerWallet;

  let xArray = [];
  let yArray = [];

  parcels.forEach(parcel => {
    xArray.push(parcel.x);
    yArray.push(parcel.y);
  });

  console.log(`creating estate.... ${xArray} - ${yArray}`);

  landContract.setWallet(sellerWallet);
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

const createEstates = async estates => {
  console.log("Creating estates...");

  const estateIds = [];
  for (let estate of estates) {
    const id = await createEstate(estate, sellerWallet);
    estateIds.push(id);
  }
  return estateIds;
};

const approveMarketplace = async () => {
  console.log("Approving Marketplace...");

  // Set false to remove approval
  const authorized = true;

  estateContract.setWallet(sellerWallet);
  const estateApproval = estateContract.setApprovalForAll(
    MARKETPLACE_ADDRESS,
    authorized,
    gasParams
  );
  await estateApproval.waitForNonceToUpdate();

  landContract.setWallet(sellerWallet);
  const landApproval = landContract.setApprovalForAll(
    MARKETPLACE_ADDRESS,
    authorized,
    gasParams
  );
  await landApproval.waitForNonceToUpdate();
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

const placeAssesOrders = async (estateIds, parcelIds) => {
  const shuffleArray = arr => arr.sort(() => Math.random() - 0.5);

  const estatesToSell = estateIds.map(id => {
    return { nftAddress: ESTATE_ADDRESS, id };
  });

  const parcelsToSell = parcelIds.map(id => {
    return { nftAddress: LAND_PROXY_ADDRESS, id };
  });

  const assetsToSell = shuffleArray([...estatesToSell, ...parcelsToSell]);

  for (let asset of assetsToSell) {
    const { nftAddress, id } = asset;
    await placeAssetSellOrder(nftAddress, id);
  }
};

const placeAssetSellOrder = async (nftAddress, assetId) => {
  marketplaceContract.setWallet(sellerWallet);
  const expireAt = Date.now() + duration.years(5);
  const price = getRandomInt(10, 100) + "000";
  const priceInWei = bigNumberify(price).mul(WeiPerEther);

  const action = marketplaceContract.createOrder(
    nftAddress,
    assetId,
    priceInWei,
    expireAt,
    gasParams
  );
  await action.waitForNonceToUpdate();
};

const getInitialParcels = () => {
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

  return parcels;
};

const getInitialEstates = () => {
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
    "https://api.decentraland.org/v1/parcels?status=open&limit=200"
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

  // Note: Since the current testnet contract was populated with the assets, this check is necessary.
  const createdParcels = getAllInitialParcels();
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
    "https://api.decentraland.org/v1/estates?status=open&limit=200"
  );
  const json = await res.json();
  const { data: jsonData } = json;
  const { estates: estatesFromAPI } = jsonData;

  let estates = estatesFromAPI.map(estate => {
    const { data } = estate;
    const { name: metadata, parcels } = data;
    return { metadata, parcels };
  });

  const createdParcels = getAllInitialParcels();
  estates = estates.filter(
    estate => !estateContainsParcelFromList(estate, createdParcels)
  );

  // Tech-debt: Rewrite that
  const createdEstates = getInitialEstates();
  let withoutDuplicates = [];
  for (let e1 of estates) {
    for (let e2 of createdEstates)
      if (!estatesWithConflict(e1, e2)) {
        withoutDuplicates = [...withoutDuplicates, e1];
        break;
      }
  }

  return withoutDuplicates.filter(e => e.parcels.length < 10);
};
