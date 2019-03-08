// This script will add land parcels, estates and sell orders to the Decentraland marketplace
// This data is being used to test the Decentraland demo app using the ganache-cli local blockchain

import { duration } from "../testHelpers/helpers";

const { ONE, TEN } = constants;

import { Action } from "../TasitSdk";
const {
  ConfigLoader,
  ERC20,
  ERC721,
  Marketplace: MarketplaceContracts,
} = Action;
const { Mana } = ERC20;
const { Estate, Land } = ERC721;
const { Decentraland } = MarketplaceContracts;

import TasitContracts from "../../../tasit-contracts/dist";
const { local } = TasitContracts;
const { MANAToken, LANDProxy, EstateRegistry, Marketplace } = local;
const { address: LAND_PROXY_ADDRESS } = LANDProxy;
const { address: ESTATE_ADDRESS } = EstateRegistry;
const { address: MARKETPLACE_ADDRESS } = Marketplace;

(async () => {
  const createEstate = async (
    estateContract,
    landContract,
    estateName,
    parcels,
    ownerWallet
  ) => {
    const { address: ownerAddress } = ownerWallet;
    let xArray = [];
    let yArray = [];

    parcels.forEach(parcel => {
      xArray.push(parcel.x);
      yArray.push(parcel.y);
    });

    landContract.setWallet(ownerWallet);
    const estateCreation = landContract.createEstateWithMetadata(
      xArray,
      yArray,
      ownerAddress,
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

    await estateCreation.waitForNonceToUpdate();

    return estateId;
  };

  const createMultipleParcels = async (
    landContract,
    parcels,
    beneficiaryAddress
  ) => {
    let xArray = [];
    let yArray = [];

    parcels.forEach(parcel => {
      xArray.push(parcel.x);
      yArray.push(parcel.y);
    });

    const parcelsAssignment = landContract.assignMultipleParcels(
      xArray,
      yArray,
      beneficiaryAddress,
      gasParams
    );
    await parcelsAssignment.waitForNonceToUpdate();
  };

  const createEstatesFromParcels = async (
    estateContract,
    landContract,
    parcels,
    beneficiary
  ) => {
    const estateIds = [];

    for (let parcel of parcels) {
      const { metadata: estateName } = parcel;
      const id = await createEstate(
        estateContract,
        landContract,
        estateName,
        [parcel],
        beneficiary
      );
      estateIds.push(id);
    }
    return estateIds;
  };

  ConfigLoader.setConfig(developmentConfig);

  const [ownerWallet, sellerWallet] = accounts;
  const { address: sellerAddress } = sellerWallet;

  const landContract = new Land(LAND_PROXY_ADDRESS, ownerWallet);
  const estateContract = new Estate(ESTATE_ADDRESS, ownerWallet);
  const marketplaceContract = new Decentraland(
    MARKETPLACE_ADDRESS,
    ownerWallet
  );

  const allParcels = [
    { x: 0, y: 1, metadata: `cool estate 0x1` },
    { x: 0, y: 2, metadata: `cool estate 0x2` },
    { x: 0, y: 3, metadata: `cool estate 0x3` },
    { x: 0, y: 4, metadata: `cool estate 0x4` },
    { x: 0, y: 5, metadata: `cool estate 0x5` },
    { x: 0, y: 6, metadata: `cool estate 0x6` },
  ];
  await createMultipleParcels(landContract, allParcels, sellerAddress);

  // Note: Often estates have more than one parcel of land in them
  // but here we just have one parcel of land in each to keep this test short
  const estateParcels = allParcels.slice(0, 5);
  const estateIds = await createEstatesFromParcels(
    estateContract,
    landContract,
    estateParcels,
    sellerWallet
  );

  estateContract.setWallet(sellerWallet);
  const estateApproval = estateContract.setApprovalForAll(
    MARKETPLACE_ADDRESS,
    true,
    gasParams
  );
  await estateApproval.waitForNonceToUpdate();

  landContract.setWallet(sellerWallet);
  const landApproval = landContract.setApprovalForAll(
    MARKETPLACE_ADDRESS,
    true,
    gasParams
  );
  await landApproval.waitForNonceToUpdate();

  const priceInWei = `${ONE}`;
  const expireAt = Date.now() + duration.years(1);

  marketplaceContract.setWallet(sellerWallet);
  for (let assetId of estateIds) {
    const createOrder = marketplaceContract.createOrder(
      ESTATE_ADDRESS,
      assetId,
      priceInWei,
      expireAt,
      gasParams
    );
    await createOrder.waitForNonceToUpdate();
  }

  const land = allParcels[5];
  const landId = await landContract.encodeTokenId(land.x, land.y);

  const createParcelOrder = marketplaceContract.createOrder(
    LAND_PROXY_ADDRESS,
    landId,
    priceInWei,
    expireAt,
    gasParams
  );
  await createParcelOrder.waitForNonceToUpdate();
})();
