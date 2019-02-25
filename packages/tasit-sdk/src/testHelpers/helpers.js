import { ethers } from "ethers";
import { Account, Action } from "../TasitSdk";
const { Contract, ERC20, ERC721, Marketplace } = Action;
const { Mana } = ERC20;
const { Estate, Land } = ERC721;
const { Decentraland } = Marketplace;
import { createFromPrivateKey } from "tasit-account/dist/testHelpers/helpers";

// The goal of the integration test suite is to use only exposed classes
// from TasitSdk. ProviderFactory is used here as an exception
// as the clearest way to get a provider
// in this test suite. Eventually, maybe ProviderFactory will move to
// some shared helper dir.
import ProviderFactory from "tasit-action/dist/ProviderFactory";

import DecentralandUtils from "./DecentralandUtils";

import {
  mineBlocks,
  createSnapshot,
  revertFromSnapshot,
  confirmBalances,
} from "tasit-action/dist/testHelpers/helpers";

import { abi as landProxyABI } from "../../../tasit-contracts/abi/LANDProxy.json";

import {
  local as localAddresses,
  ropsten as ropstenAddresses,
} from "../../../tasit-contracts/3rd-parties/decentraland/addresses";

const {
  utils: ethersUtils,
  constants: ethersConstants,
  Contract: ethersContract,
} = ethers;
const { WeiPerEther } = ethersConstants;
const { bigNumberify } = ethersUtils;

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
  const {
    MANAToken: MANA_ADDRESS,
    LANDRegistry: LAND_ADDRESS,
    LANDProxy: LAND_PROXY_ADDRESS,
    EstateRegistry: ESTATE_ADDRESS,
    Marketplace: MARKETPLACE_ADDRESS,
  } = localAddresses;

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

const etherFaucet = async (
  provider,
  fromWallet,
  beneficiaryAddress,
  amountInWei
) => {
  const connectedFromWallet = fromWallet.connect(provider);
  const tx = await connectedFromWallet.sendTransaction({
    // ethers.utils.parseEther("1.0")
    value: "0x0de0b6b3a7640000",
    to: beneficiaryAddress,
  });
  await provider.waitForTransaction(tx.hash);
};

const ownedManaFaucet = async (
  manaContract,
  ownerWallet,
  beneficiary,
  amountInWei
) => {
  manaContract.setWallet(ownerWallet);
  const mintManaToBuyer = manaContract.mint(
    beneficiary.address,
    amountInWei.toString()
  );
  await mintManaToBuyer.waitForNonceToUpdate();
  await confirmBalances(manaContract, [beneficiary.address], [amountInWei]);
};

const addressesAreEqual = (address1, address2) => {
  return address1.toUpperCase() === address2.toUpperCase();
};

// The Mana contract deployed on ropsten network has a setBalance function
const ropstenManaFaucet = async (provider, walletWithGas, to, amountInWei) => {
  const { MANAToken: MANA_ADDRESS } = ropstenAddresses;
  const connectedWallet = walletWithGas.connect(provider);
  const manaABI = ["function setBalance(address to, uint256 amount)"];
  const mana = new ethersContract(MANA_ADDRESS, manaABI, connectedWallet);
  const tx = await mana.setBalance(to.address, amountInWei);
  await provider.waitForTransaction(tx.hash);
};

// In weis
// Note: ethers.js uses BigNumber internally
// That accepts decimal strings (Ref: https://docs.ethers.io/ethers.js/html/api-utils.html#creating-instances)
// Scientific notation works if the number is small enough (< 1e21) to be converted to string properly
// See more: https://github.com/ethers-io/ethers.js/issues/228
const ONE = bigNumberify(1).mul(WeiPerEther);
const TEN = bigNumberify(10).mul(WeiPerEther);
const BILLION = bigNumberify(`${1e9}`).mul(WeiPerEther);

const constants = {
  ONE,
  TEN,
  BILLION,
  WeiPerEther,
};

export {
  mineBlocks,
  createSnapshot,
  revertFromSnapshot,
  confirmBalances,
  gasParams,
  setupWallets,
  setupContracts,
  duration,
  createParcels,
  createEstatesFromParcels,
  getEstateSellOrder,
  etherFaucet,
  ownedManaFaucet,
  ropstenManaFaucet,
  addressesAreEqual,
  bigNumberify,
  constants,
  ProviderFactory,
  DecentralandUtils,
};
