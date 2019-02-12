import { Account, Action } from "../TasitSdk";
const { Contract, NFT, ERC20, ERC721, Marketplace } = Action;
const { Mana } = ERC20;
const { Estate, Land } = ERC721;
const { Decentraland } = Marketplace;
import { createFromPrivateKey } from "tasit-account/dist/testHelpers/helpers";

// Note: Should LandProxy exists as TasitAction contract object also?
import { abi as landProxyABI } from "./abi/LANDProxy.json";

import { local as localAddresses } from "../../../tasit-contracts/decentraland/addresses";
const {
  MANAToken: MANA_ADDRESS,
  LANDRegistry: LAND_ADDRESS,
  LANDProxy: LAND_PROXY_ADDRESS,
  EstateRegistry: ESTATE_ADDRESS,
  Marketplace: MARKETPLACE_ADDRESS,
} = localAddresses;

const FULLNFT_ADDRESS = "0x0E86f209729bf54763789CDBcA9E8b94f0FD5333";

const ownerPrivKey =
  "0x11d943d7649fbdeb146dc57bd9cfc80b086bfab2330c7b25651dbaf382392f60";
const sellerPrivKey =
  "0xc181b6b02c9757f13f5aa15d1342a58970a8a489722dc0608a1d09fea717c181";
const buyerPrivKey =
  "0x4f09311114f0ff4dfad0edaa932a3e01a4ee9f34da2cbd087aa0e6ffcb9eb322";

// TODO: Go deep on gas handling.
// Without that, VM returns a revert error instead of out of gas error.
// See: https://github.com/tasitlabs/TasitSDK/issues/173
const gasParams = {
  gasLimit: 7e6,
  gasPrice: 1e9,
};

const setupWallets = () => {
  const ownerWallet = createFromPrivateKey(ownerPrivKey);
  const sellerWallet = createFromPrivateKey(sellerPrivKey);
  const buyerWallet = createFromPrivateKey(buyerPrivKey);
  const ephemeralWallet = Account.create();

  return { ownerWallet, sellerWallet, buyerWallet, ephemeralWallet };
};

const setupContracts = async ownerWallet => {
  // Note: It would be cooler to use NFT here if
  // Decentraland Land contract followed ERC721 exactly
  const landContract = new Land(LAND_ADDRESS, ownerWallet);
  const landProxyContract = new Contract(
    LAND_PROXY_ADDRESS,
    landProxyABI,
    ownerWallet
  );
  const estateContract = new Estate(ESTATE_ADDRESS, ownerWallet);

  const manaContract = new Mana(MANA_ADDRESS, ownerWallet);
  const marketplaceContract = new Decentraland(
    MARKETPLACE_ADDRESS,
    ownerWallet
  );
  const landProxyContractWithLandABI = new Land(
    LAND_PROXY_ADDRESS,
    ownerWallet
  );

  const landProxyUpgrade = landProxyContract.upgrade(
    LAND_ADDRESS,
    ownerWallet.address,
    gasParams
  );
  await landProxyUpgrade.waitForNonceToUpdate();

  const estateInitialize = estateContract.initialize(
    "Estate",
    "EST",
    landProxyContract.getAddress()
  );
  await estateInitialize.waitForNonceToUpdate();

  const landInitialize = landProxyContractWithLandABI.initialize(
    ownerWallet.address,
    gasParams
  );
  await landInitialize.waitForNonceToUpdate();

  const landEstateSetup = landProxyContractWithLandABI.setEstateRegistry(
    estateContract.getAddress(),
    gasParams
  );
  await landEstateSetup.waitForNonceToUpdate();

  const marketplaceInitialize = marketplaceContract.initialize(
    manaContract.getAddress(),
    estateContract.getAddress(),
    ownerWallet.address
  );
  await marketplaceInitialize.waitForNonceToUpdate();

  return {
    manaContract,
    landContract: landProxyContractWithLandABI,
    estateContract,
    marketplaceContract,
  };
};

const createParcels = async (landContract, parcels, beneficiary) => {
  let xArray = [];
  let yArray = [];
  parcels.forEach(parcel => {
    xArray.push(parcel.x);
    yArray.push(parcel.y);
  });

  const parcelsAssignment = landContract.assignMultipleParcels(
    xArray,
    yArray,
    beneficiary.address,
    gasParams
  );
  await parcelsAssignment.waitForNonceToUpdate();
};

const createEstate = async (
  estateContract,
  landContract,
  estateName,
  parcels,
  ownerWallet
) => {
  landContract.setWallet(ownerWallet);

  let xArray = [];
  let yArray = [];
  parcels.forEach(parcel => {
    xArray.push(parcel.x);
    yArray.push(parcel.y);
  });

  const estateCreation = landContract.createEstateWithMetadata(
    xArray,
    yArray,
    ownerWallet.address,
    estateName,
    gasParams
  );

  const estateId = await new Promise(function(resolve, reject) {
    estateContract.once("CreateEstate", message => {
      const { data } = message;
      const { args } = data;
      resolve(args._estateId);
    });
  });

  await estateCreation.waitForNonceToUpdate();

  return estateId;
};

const createEstatesFromParcels = async (
  estateContract,
  landContract,
  parcels,
  beneficiary
) => {
  const estateIds = [];
  await createParcels(landContract, parcels, beneficiary);

  for (let parcel of parcels) {
    const id = await createEstate(
      estateContract,
      landContract,
      `cool estate ${parcel.x}x${parcel.y}`,
      [parcel],
      beneficiary
    );
    estateIds.push(id);
  }
  return estateIds;
};

const getEstateSellOrder = async (
  marketplaceContract,
  esteteContract,
  estateId
) => {
  const [
    orderId,
    seller,
    price,
    expiresAt,
  ] = await marketplaceContract.auctionByAssetId(estateId);

  const hasOrder = parseInt(orderId, 16) !== 0;
  if (!hasOrder) return null;

  const estateName = await esteteContract.getMetadata(estateId);

  return {
    estateId,
    estateName,
    orderId,
    seller,
    price,
    expiresAt,
  };
};

const duration = {
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

export {
  gasParams,
  setupWallets,
  setupContracts,
  duration,
  createParcels,
  createEstatesFromParcels,
  getEstateSellOrder,
};
