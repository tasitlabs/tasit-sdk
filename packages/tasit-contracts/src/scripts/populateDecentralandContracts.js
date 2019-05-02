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

const {
  ONE,
  TEN,
  ONE_HUNDRED,
  ONE_THOUSAND,
  BILLION,
  WEI_PER_ETHER,
} = constants;

let network = process.env.NETWORK;
if (!network) {
  throw new Error(
    `Use NETWORK env argument to choose which chain will be populated.`
  );
} else {
  console.log(`Populating data to the '${network}' chain...`);
}

let EVENTS_TIMEOUT;
let ASSETS_TO_CREATE;

const config = require(`../config/${network}.js`);

if (network === "development") {
  network = "local";
  EVENTS_TIMEOUT = 2500; // 2.5 seconds
  ASSETS_TO_CREATE = 20;
} else {
  // non-local chains
  EVENTS_TIMEOUT = 5 * 60 * 1000;
  ASSETS_TO_CREATE = 100;

  // https://stats.goerli.net/
  if (network === "goerli") {
    gasParams = {
      gasLimit: 8e6,
      gasPrice: 1e10,
    };
  }
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

const cancelSellOrder = async (nftAddress, id) => {
  const action = marketplaceContract.cancelOrder(nftAddress, `${id}`);
  await action.send();
  await action.waitForOneConfirmation();
};

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
        `Removing order of estate (id: ${id}) because it has a blank image.`
      );

      await cancelSellOrder(ESTATE_ADDRESS, id);
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

const updateParcelsData = async parcels => {
  console.log("Updating parcels with metadata...");

  landContract.setWallet(sellerWallet);
  for (let parcel of parcels) {
    let { x, y, metadata: parcelName } = parcel;
    console.log(`Setting metadata for parcel (${x},${y})...`);
    if (parcelName && parcelName !== "") {
      const updateAction = landContract.updateLandData(x, y, parcelName);
      await updateAction.send();
      await updateAction.waitForOneConfirmation();
      console.log("Done");
    }
    console.log("Skipped because this parcel has no metadata.");
  }
};

const getIdsFromParcels = async parcels => {
  const parcelIds = [];
  for (let parcel of parcels) {
    const { x, y } = parcel;
    const id = await landContract.encodeTokenId(`${x}`, `${y}`);
    parcelIds.push(id);
  }

  return parcelIds;
};

// Tech-debt: Use `assignMultipleParcels` to save gas cost.
// The amount of parcels per call should be short enough to avoid out-of-gas.
const createParcels = async parcels => {
  console.log("Creating parcels...");

  let parcelIds = [];
  for (let parcel of parcels) {
    try {
      const id = await createParcel(parcel);
      parcelIds.push(id);
    } catch (error) {
      console.log("Parcel creation failed");
    }
  }

  await updateParcelsData(parcels);

  return parcelIds;
};

const createParcel = async parcel => {
  const { x, y } = parcel;
  landContract.setWallet(minterWallet);
  const action = landContract.assignNewParcel(`${x}`, `${y}`, sellerAddress);
  await action.send();

  console.log(`Creating parcel (${x},${y})...`);

  const parcelId = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.log(`Timeout reached for parcel (${x},${y}) creation.`);
      action.unsubscribe();
      reject();
    }, EVENTS_TIMEOUT);

    action.on("confirmation", async message => {
      const id = await landContract.encodeTokenId(`${x}`, `${y}`);
      action.unsubscribe();
      clearTimeout(timeout);
      resolve(id);
    });

    action.on("error", error => {
      const { message } = error;
      console.log(message);
      action.unsubscribe();
      reject();
    });
  });

  await action.waitForOneConfirmation();
  console.log(`Parcel ID = ${parcelId}`);

  return parcelId;
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

  console.log(`Creating estate (${xArray} - ${yArray})...`);

  landContract.setWallet(sellerWallet);
  const action = landContract.createEstateWithMetadata(
    xArray,
    yArray,
    beneficiaryAddress,
    `${estateName}`
  );
  await action.send();

  const estateId = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.log(
        `Timeout reached for estate (${xArray} - ${yArray}) creation.`
      );
      estateContract.unsubscribe();
      action.unsubscribe();
      reject();
    }, EVENTS_TIMEOUT);

    // Some error (orphan block, failed tx) events are being triggered only from the confirmationListener
    // See more: https://github.com/tasitlabs/TasitSDK/issues/253
    action.on("confirmation", message => {});

    action.on("error", error => {
      const { message } = error;
      console.log(message);
      action.unsubscribe();
      reject();
    });

    estateContract.on("error", error => {
      const { message } = error;
      console.log(message);
      estateContract.unsubscribe();
      reject();
    });

    estateContract.on("CreateEstate", message => {
      const { data } = message;
      const { args } = data;
      action.unsubscribe();
      estateContract.unsubscribe();
      clearTimeout(timeout);
      resolve(args._estateId);
    });
  });

  await action.waitForOneConfirmation();
  console.log(`Estate ID = ${estateId}`);

  return estateId;
};

const createEstates = async estates => {
  console.log("Creating estates...");

  const estateIds = [];
  for (let estate of estates) {
    try {
      const id = await createEstate(estate);
      estateIds.push(id);
    } catch (error) {
      console.log("Estate creation failed");
    }
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
    authorized
  );
  await estateApproval.send();
  await estateApproval.waitForOneConfirmation();

  landContract.setWallet(sellerWallet);
  const landApproval = landContract.setApprovalForAll(
    MARKETPLACE_ADDRESS,
    authorized
  );
  await landApproval.send();
  await landApproval.waitForOneConfirmation();
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

const placeAssetOrders = async (estateIds, parcelIds) => {
  console.log(`Placing sell orders...`);
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
  const expireAt = Date.now() + duration.years(5);
  const price = getRandomInt(10, 100) + "000";
  const priceInWei = bigNumberify(price).mul(WEI_PER_ETHER);

  const type = nftAddress == ESTATE_ADDRESS ? "estate" : "parcel";
  console.log(`placing sell order for the ${type} with id ${assetId}`);

  marketplaceContract.setWallet(sellerWallet);
  const action = marketplaceContract.createOrder(
    nftAddress,
    assetId,
    priceInWei,
    expireAt
  );
  await action.send();
  await action.waitForOneConfirmation();
};

const parcelsAreEqual = (p1, p2) => p1.x === p2.x && p1.y === p2.y;

const findParcel = (parcel, listOfParcels) => {
  return listOfParcels.find(p => parcelsAreEqual(p, parcel));
};

const estateContainsParcelFromList = (estate, listOfParcels) => {
  const { parcels: estateParcels } = estate;

  for (let parcel of estateParcels)
    if (findParcel(parcel, listOfParcels)) return true;

  return false;
};

const getEstatesFromAPI = async () => {
  // Note: In the future, we can get the same data from Decentraland contracts
  // to move away from this point of centralization
  const assetsToCreate = ASSETS_TO_CREATE / 2;
  const res = await fetch(
    `https://api.decentraland.org/v1/estates?status=open&limit=${assetsToCreate}`
  );
  const json = await res.json();
  const { data: jsonData } = json;
  const { estates: estatesFromAPI } = jsonData;

  const allEstates = estatesFromAPI.map(estate => {
    const { data } = estate;
    const { name: metadata, parcels } = data;
    return { metadata, parcels };
  });

  // Keep estates with small number of parcels to avoid out-of-gas on creation
  const estates = allEstates.filter(e => e.parcels.length < 10);
  return estates;
};

const getParcelsFromAPI = async () => {
  // Note: In the future, we can get the same data from Decentraland contracts
  // to move away from this point of centralization
  const assetsToCreate = ASSETS_TO_CREATE / 2;
  const res = await fetch(
    `https://api.decentraland.org/v1/parcels?status=open&limit=${assetsToCreate}`
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

  return parcels;
};

(async () => {
  try {
    // Fund Gnosis Safe wallet with Mana tokens and ethers
    await etherFaucet(provider, minterWallet, GNOSIS_SAFE_ADDRESS, TEN);
    await expectExactEtherBalances(provider, [GNOSIS_SAFE_ADDRESS], [TEN]);
    await erc20Faucet(manaContract, minterWallet, GNOSIS_SAFE_ADDRESS, BILLION);
    await expectExactTokenBalances(
      manaContract,
      [GNOSIS_SAFE_ADDRESS],
      [BILLION]
    );

    const [parcels, estates] = await Promise.all([
      getParcelsFromAPI(),
      getEstatesFromAPI(),
    ]);

    const estatesParcels = extractParcelsFromEstates(estates).filter(
      estateParcel => !findParcel(estateParcel, parcels)
    );

    const parcelIds = await createParcels(parcels);

    await createParcels(estatesParcels);
    const estateIds = await createEstates(estates);

    await approveMarketplace();

    await placeAssetOrders(estateIds, parcelIds);

    // Removing orders from non-development chains
    if (network !== "local") await cancelOrdersOfEstatesWithoutImage(estateIds);
  } catch (err) {
    console.error(err);
  }
})();
