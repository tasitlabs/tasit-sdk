//
// Script used to check if the target chain has the Decentraland app pre-conditions
//
// Note: This script is using mocha for convenience but isn't a test suite to be run by the `test` script.
//

import { Action } from "../TasitSdk";
const { ERC20 } = Action;
const { Mana } = ERC20;

import helpers from "../testHelpers/helpers";
const {
  constants,
  expectMinimumEtherBalances,
  expectMinimumTokenBalances,
  addressesAreEqual,
  accounts,
  bigNumberify,
  ProviderFactory,
} = helpers;

import DecentralandUtils from "../helpers/DecentralandUtils";

const fetch = require("node-fetch");

const { TWO, TEN, BILLION, TOKEN_SUBDIVISIONS } = constants;

const provider = ProviderFactory.getProvider();

// TODO: Create a getContracts function
const { _network: network } = provider;
const networkName = !network ? "local" : network.name;
import TasitContracts from "tasit-contracts";
const { LANDProxy, EstateRegistry, MANAToken, GnosisSafe } = TasitContracts[
  networkName
];
const { address: LAND_PROXY_ADDRESS } = LANDProxy;
const { address: ESTATE_ADDRESS } = EstateRegistry;
const { address: MANA_ADDRESS } = MANAToken;
const { address: GNOSIS_SAFE_ADDRESS } = GnosisSafe;

describe("Decentraland App pre-conditions", () => {
  const mana = new Mana(MANA_ADDRESS);
  // Note: Since accounts[0] is being used as owner of all deployed contracts
  // We are using accounts[9] for Gnosis Safe test cases to make sure that it
  // doesn't have undesired extra privilege access.
  const gnosisSafeOwner = accounts[9];
  const decentralandUtils = new DecentralandUtils();
  const { getAllAssetsForSale } = decentralandUtils;
  let assetsForSale = [];

  before("load assets for sale from blockchain", async () => {
    assetsForSale = await getAllAssetsForSale();
  });

  describe("Gnosis Safe wallet", () => {
    it("should have at least ten ethers", async () => {
      await expectMinimumEtherBalances(provider, [GNOSIS_SAFE_ADDRESS], [TEN]);
    });

    it("should have at least a billion MANA", async () => {
      await expectMinimumTokenBalances(mana, [GNOSIS_SAFE_ADDRESS], [BILLION]);
    });
  });

  describe("Gnosis Safe wallet owner", () => {
    it("should have at least two ethers", async () => {
      const { address: gnosisSafeOwnerAddress } = gnosisSafeOwner;
      await expectMinimumEtherBalances(
        provider,
        [gnosisSafeOwnerAddress],
        [TWO]
      );
    });
  });

  describe("Marketplace", () => {
    it("should have at least 50 assets for sale", async () => {
      expect(assetsForSale.length).to.be.at.least(50);
    });

    it("should have at least 1 parcel for sale", async () => {
      const parcelsForSale = assetsForSale.filter(asset =>
        addressesAreEqual(asset.nftAddress, LAND_PROXY_ADDRESS)
      );
      expect(parcelsForSale.length).to.be.at.least(1);
    });

    it("should have at least 1 estate for sale", async () => {
      const estatessForSale = assetsForSale.filter(asset =>
        addressesAreEqual(asset.nftAddress, ESTATE_ADDRESS)
      );
      expect(estatessForSale.length).to.be.at.least(1);
    });

    it("shouldn't have any duplicated sell orders", async () => {
      const assetForSaleIds = [];
      assetsForSale.forEach(assetForSale => {
        let { assetId } = assetForSale;
        assetId = `${assetId}`;
        if (!assetForSaleIds.includes(assetId)) assetForSaleIds.push(assetId);
      });

      expect(assetsForSale.length).to.equal(assetForSaleIds.length);
    });

    it("Assets for sale", async () => {
      const minPrice = bigNumberify("10000").mul(TOKEN_SUBDIVISIONS);
      const maxPrice = bigNumberify("100000").mul(TOKEN_SUBDIVISIONS);

      const blankImage = await fetch(
        "https://api.decentraland.org/v1/estates/5/map.png"
      );
      const blankImageData = (await blankImage.buffer()).toString("base64");

      for (let asset of assetsForSale) {
        const { assetId, nftAddress, priceInWei } = asset;
        const price = bigNumberify(priceInWei);

        const isParcel = addressesAreEqual(nftAddress, LAND_PROXY_ADDRESS);
        const isEstate = addressesAreEqual(nftAddress, ESTATE_ADDRESS);

        expect(price.gte(minPrice), `${price} isn't >= ${minPrice}`).to.be.true;
        expect(price.lte(maxPrice), `${price} isn't <= ${maxPrice}`).to.be.true;

        if (isEstate) {
          const image = await fetch(
            `https://api.decentraland.org/v1/estates/${assetId}/map.png`
          );
          const imageData = (await image.buffer()).toString("base64");
          expect(
            imageData,
            `The image of the estate (id: ${assetId}) is blank`
          ).not.equals(blankImageData);
        } else if (isParcel) {
          // Note: Parcel assets always show correct image
        }
      }
    });
  });
});
