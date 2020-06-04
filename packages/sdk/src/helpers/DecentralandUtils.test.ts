import { Account, Action } from "../TasitSdk";
import helpers from "../testHelpers/helpers";
import DecentralandUtils from "./DecentralandUtils";

const { ERC721 } = Action;
const { Estate, Land } = ERC721;

const { accounts, getContractsAddresses } = helpers;

const { LAND_ADDRESS, ESTATE_ADDRESS } = getContractsAddresses();

// Note: This test suite assumes that all parcels and estates of SellerWallet are for sale
// See more: `tasit-sdk/packages/contracts/src/script/populateDecentralandContracts.ts`
describe("DecentralandUtils", () => {
  const [, sellerWallet] = accounts;
  let ephemeralWallet;
  let land;
  let estate;

  const decentralandUtils = new DecentralandUtils();
  const {
    getAllAssetsForSale,
    _getEstatesOf,
    _getParcelsOf,
    getAssetsOf,
  } = decentralandUtils;

  const { address: sellerAddress } = sellerWallet;
  let ephemeralAddress;

  const isAssetAnEstate = asset => asset.nftAddress === estate.getAddress();
  const isAssetAParcel = asset => asset.nftAddress === land.getAddress();

  beforeEach("", async () => {
    land = new Land(LAND_ADDRESS);
    estate = new Estate(ESTATE_ADDRESS);

    ephemeralWallet = Account.create();
    ({ address: ephemeralAddress } = ephemeralWallet);
  });

  it("should get parcels for sale", async () => {
    const assetsForSale = await getAllAssetsForSale();

    const parcelsForSale = assetsForSale.filter(isAssetAParcel);
    const { length: parcelsForSaleAmount } = parcelsForSale;

    const parcelsOfSeller = await land.balanceOf(sellerAddress);

    expect(`${parcelsOfSeller}`).to.equal(`${parcelsForSaleAmount}`);
  });

  it("should get estates for sale", async () => {
    const assetsForSale = await getAllAssetsForSale();

    const estatesForSale = assetsForSale.filter(isAssetAnEstate);
    const { length: estatesForSaleAmount } = estatesForSale;

    const estatesOfSeller = await estate.balanceOf(sellerAddress);

    expect(`${estatesOfSeller}`).to.equal(`${estatesForSaleAmount}`);
  });

  it("should get assets owned by an address", async () => {
    const estateContractAddress = estate.getAddress();

    const sellerEstates = await _getEstatesOf(sellerAddress);
    const sellerEstateBalance = await estate.balanceOf(sellerAddress);
    expect(sellerEstates).to.have.lengthOf(sellerEstateBalance);

    const sellerParcels = await _getParcelsOf(sellerAddress);
    const sellerParcelBalance = await land.balanceOf(sellerAddress);
    expect(sellerParcels).to.have.lengthOf(sellerParcelBalance);

    const estateParcels = await _getParcelsOf(estateContractAddress);
    const estateParcelBalance = await land.balanceOf(estateContractAddress);
    expect(estateParcels).to.have.lengthOf(estateParcelBalance);

    const sellerAssets = await getAssetsOf(sellerAddress);
    const sellerAssetIds = sellerAssets.map(a => a.id);
    const sellerEstateIds = sellerEstates.map(e => e.id);
    const sellerParcelIds = sellerParcels.map(p => p.id);
    expect(sellerAssetIds).to.have.members([
      ...sellerParcelIds,
      ...sellerEstateIds,
    ]);
  });

  it("should get empty array from an address without assets", async () => {
    const estateIds = await _getEstatesOf(ephemeralAddress);
    const parcelIds = await _getParcelsOf(ephemeralAddress);

    expect(estateIds).deep.equal([]);
    expect(parcelIds).deep.equal([]);
  });

  it("should expose transactionHash", async () => {
    const expectAssetHasTxHash = asset =>
      expect(asset.transactionHash).to.be.ok;

    const sellerAssets = await getAssetsOf(sellerAddress);
    expect(sellerAssets).to.not.be.empty;
    sellerAssets.forEach(expectAssetHasTxHash);

    const assetsForSale = await getAllAssetsForSale();
    expect(assetsForSale).to.not.be.empty;
    assetsForSale.forEach(expectAssetHasTxHash);
  });
});
