import { Account, Action } from "../TasitSdk";
const { ConfigLoader, ERC20, ERC721, Marketplace } = Action;
const { Mana } = ERC20;
const { Estate, Land } = ERC721;
const { Decentraland } = Marketplace;
import DecentralandUtils from "./DecentralandUtils";

// Note: This test suite assumes that all parcels and estates of SellerWallet are for sale
// See more: `TasitSDk/packages/tasit-contracts/src/script/populateDecentralandContracts.js`
describe("DecentralandUtils", () => {
  const [minterWallet, sellerWallet] = accounts;
  let ephemeralWallet;
  let mana;
  let land;
  let estate;
  let marketplace;
  const decentralandUtils = new DecentralandUtils();
  const {
    getAllAssetsForSale,
    _getEstateIdsOf,
    _getParcelIdsOf,
    getAssetsOf,
  } = decentralandUtils;

  const { address: sellerAddress } = sellerWallet;
  let ephemeralAddress;

  const isAssetAnEstate = asset => asset.nftAddress === estate.getAddress();
  const isAssetAParcel = asset => asset.nftAddress === land.getAddress();

  beforeEach("", async () => {
    mana = new Mana(MANA_ADDRESS);
    land = new Land(LAND_PROXY_ADDRESS);
    estate = new Estate(ESTATE_ADDRESS);
    marketplace = new Decentraland(MARKETPLACE_ADDRESS);

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
    const assetsForSale = await getAllAssetsForSale();

    const estateContractAddress = estate.getAddress();

    const sellerEstateIds = await _getEstateIdsOf(sellerAddress);
    const sellerEstateBalance = await estate.balanceOf(sellerAddress);
    const { length: sellerEstateIdsLength } = sellerEstateIds;
    expect(`${sellerEstateIdsLength}`).to.equal(`${sellerEstateBalance}`);

    const sellerParcelIds = await _getParcelIdsOf(sellerAddress);
    const sellerParcelBalance = await land.balanceOf(sellerAddress);
    const { length: sellerParcelIdsLength } = sellerParcelIds;
    expect(`${sellerParcelIdsLength}`).to.equal(`${sellerParcelBalance}`);

    const estateParcelIds = await _getParcelIdsOf(estateContractAddress);
    const estateParcelBalance = await land.balanceOf(estateContractAddress);
    const { length: estateParcelIdsLength } = estateParcelIds;
    expect(`${estateParcelIdsLength}`).to.equal(`${estateParcelBalance}`);

    const sellerAsset = await getAssetsOf(sellerAddress);
    const sellerAssetIds = sellerAsset.map(asset => asset.id);
    expect(sellerAssetIds).to.have.members([
      ...sellerParcelIds,
      ...sellerEstateIds,
    ]);
  });

  it("should get empty array from an address without assets", async () => {
    const estateIds = await _getEstateIdsOf(ephemeralAddress);
    const parcelIds = await _getParcelIdsOf(ephemeralAddress);

    expect(estateIds).deep.equal([]);
    expect(parcelIds).deep.equal([]);
  });

  it("should get transactionHash for all public functions", async () => {});
});
