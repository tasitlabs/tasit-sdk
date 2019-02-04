import { Account, Action } from "../TasitSdk";
const { Contract, NFT } = Action;
import { createFromPrivateKey } from "tasit-account/dist/testHelpers/helpers";

import { abi as manaABI } from "./abi/MANAToken.json";
import { abi as landABI } from "./abi/LANDRegistry.json";
import { abi as landProxyABI } from "./abi/LANDProxy.json";
import { abi as estateABI } from "./abi/EstateRegistry.json";
import { abi as markplaceABI } from "./abi/Marketplace.json";

const manaAddress = "0xb32939da0c44bf255b9810421a55be095f9bb3f4";
const landAddress = "0x6191bc768c2339da9eab9e589fc8bf0b3ab80975";
const landProxyAddress = "0x773f11ed472aa43e4ebaa963bcfbbea5a10c1bbd";
const estateAddress = "0x41b598a2c618b59b74540ac3afffb32f7971b37a";
const marketplaceAddress = "0x07c0e972064e5c05f7b3596d81de1afd35457eae";
const fullNFTAddress = "0x0E86f209729bf54763789CDBcA9E8b94f0FD5333";

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
  const landContract = new Contract(landAddress, landABI, ownerWallet);
  const landProxyContract = new Contract(
    landProxyAddress,
    landProxyABI,
    ownerWallet
  );
  const estateContract = new Contract(estateAddress, estateABI, ownerWallet);

  const manaContract = new Contract(manaAddress, manaABI, ownerWallet);
  const marketplaceContract = new Contract(
    marketplaceAddress,
    markplaceABI,
    ownerWallet
  );
  const landProxyContractWithLandABI = new Contract(
    landProxyContract.getAddress(),
    landABI,
    ownerWallet
  );

  const landProxyUpgrade = landProxyContract.upgrade(
    landContract.getAddress(),
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
