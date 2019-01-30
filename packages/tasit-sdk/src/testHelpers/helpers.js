import { Account, Action } from "../TasitSdk";
const { Contract, NFT } = Action;

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

// TODO: Go deep on gas handling.
// Without that, VM returns a revert error instead of out of gas error.
// See: https://github.com/tasitlabs/TasitSDK/issues/173
const gasParams = {
  gasLimit: 7e6,
  gasPrice: 1e9,
};

const setupContracts = async owner => {
  // Note: It would be cooler to use NFT here if
  // Decentraland Land contract followed ERC721 exactly
  const land = new Contract(landAddress, landABI, owner);
  const landProxy = new Contract(landProxyAddress, landProxyABI, owner);
  const estate = new Contract(estateAddress, estateABI, owner);

  const mana = new Contract(manaAddress, manaABI, owner);
  const marketplace = new Contract(marketplaceAddress, markplaceABI, owner);
  const proxyWithLandABI = new Contract(landProxy.getAddress(), landABI, owner);

  const landProxyUpgrade = landProxy.upgrade(
    land.getAddress(),
    owner.address,
    gasParams
  );
  await landProxyUpgrade.waitForNonceToUpdate();

  const estateInitialize = estate.initialize(
    "Estate",
    "EST",
    landProxy.getAddress()
  );
  await estateInitialize.waitForNonceToUpdate();

  const landInitialize = proxyWithLandABI.initialize(owner.address, gasParams);
  await landInitialize.waitForNonceToUpdate();

  const landEstateSetup = proxyWithLandABI.setEstateRegistry(
    estate.getAddress(),
    gasParams
  );
  await landEstateSetup.waitForNonceToUpdate();

  const marketplaceInitialize = marketplace.initialize(
    mana.getAddress(),
    estate.getAddress(),
    owner.address
  );
  await marketplaceInitialize.waitForNonceToUpdate();

  return {
    mana,
    land: proxyWithLandABI,
    estate,
    marketplace,
  };
};

const prepareTokens = async (mana, land, estate, owner, seller, buyer) => {
  const auth = land.authorizeDeploy(owner.address, gasParams);
  await auth.waitForNonceToUpdate();

  const parcelsAssignment = land.assignMultipleParcels(
    [0, 0],
    [1, 2],
    seller.address,
    gasParams
  );
  await parcelsAssignment.waitForNonceToUpdate();

  land.setWallet(seller);
  const updateParcel1 = land.updateLandData(0, 1, "parcel one", gasParams);
  await updateParcel1.waitForNonceToUpdate();

  const updateParcel2 = land.updateLandData(0, 2, "parcel two", gasParams);
  await updateParcel2.waitForNonceToUpdate();

  const createEstate = land.createEstateWithMetadata(
    [0, 0],
    [1, 2],
    seller.address,
    "cool estate",
    gasParams
  );
  await createEstate.waitForNonceToUpdate();
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

export { gasParams, setupContracts, prepareTokens, duration };
