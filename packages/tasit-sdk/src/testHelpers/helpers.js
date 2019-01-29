import { Account, Action } from "../TasitSdk";
const { Contract, NFT } = Action;

import { abi as manaABI } from "./MANAToken.json";
import { abi as landABI } from "./LANDRegistry.json";
import { abi as landProxyABI } from "./LANDProxy.json";
import { abi as estateABI } from "./EstateRegistry.json";
import { abi as markplaceABI } from "./Marketplace.json";

const manaAddress = "0xb32939da0c44bf255b9810421a55be095f9bb3f4";
const landAddress = "0x6191bc768c2339da9eab9e589fc8bf0b3ab80975";
const landProxyAddress = "0x773f11ed472aa43e4ebaa963bcfbbea5a10c1bbd";
const estateAddress = "0x41b598a2c618b59b74540ac3afffb32f7971b37a";
const marketplaceAddress = "0x289c42facf691946b64b4370361b1303f0a463ef";

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
  const mana = new Contract(manaAddress, manaABI, owner);
  let land = new Contract(landAddress, landABI, owner);
  const landProxy = new Contract(landProxyAddress, landProxyABI, owner);
  const estate = new Contract(estateAddress, estateABI, owner);
  const marketplace = new Contract(marketplaceAddress, markplaceABI, owner);

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

  land = new Contract(landProxy.getAddress(), landABI, owner);

  const landInitialize = land.initialize(owner.address, gasParams);
  await landInitialize.waitForNonceToUpdate();

  const landEstateSetup = land.setEstateRegistry(
    estate.getAddress(),
    gasParams
  );
  await landEstateSetup.waitForNonceToUpdate();

  return {
    mana,
    land,
    estate,
    marketplace,
  };
};

const populateLands = async (land, estate, owner, beneficiary) => {
  const auth = land.authorizeDeploy(owner.address, gasParams);
  await auth.waitForNonceToUpdate();

  const parcelsAssignment = land.assignMultipleParcels(
    [0, 0],
    [1, 2],
    beneficiary.address,
    gasParams
  );
  await parcelsAssignment.waitForNonceToUpdate();

  land.setWallet(beneficiary);
  const updateParcel1 = land.updateLandData(0, 1, "parcel one", gasParams);
  await updateParcel1.waitForNonceToUpdate();

  const updateParcel2 = land.updateLandData(0, 2, "parcel two", gasParams);
  await updateParcel2.waitForNonceToUpdate();

  const createEstate = land.createEstateWithMetadata(
    [0, 0],
    [1, 2],
    beneficiary.address,
    "cool estate",
    gasParams
  );
  await createEstate.waitForNonceToUpdate();
};

export { gasParams, setupContracts, populateLands };
