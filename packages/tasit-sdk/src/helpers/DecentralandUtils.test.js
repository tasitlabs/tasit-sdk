import { Action } from "../TasitSdk";
const { ConfigLoader, ERC20, ERC721, Marketplace } = Action;
const { Mana } = ERC20;
const { Estate, Land } = ERC721;
const { Decentraland } = Marketplace;
import DecentralandUtils from "./DecentralandUtils";

// Note: This test suite assumes that all parcels and estates of SellerWallet are for sale
// See more: `TasitSDk/packages/tasit-contracts/src/script/populateDecentralandContracts.js`
describe("DecentralandUtils", () => {
  const [minterWallet, sellerWallet] = accounts;
  const { address: sellerAddress } = sellerWallet;
  let mana;
  let land;
  let estate;
  let marketplace;
  const decentralandUtils = new DecentralandUtils();
  const {
    getAllAssetsForSale,
    getEstateIdsOf,
    getParcelIdsOf,
    getAssetsOf,
  } = decentralandUtils;
  let assetsForSale;

  const isAssetAnEstate = asset => asset.nftAddress === estate.getAddress();
  const isAssetAParcel = asset => asset.nftAddress === land.getAddress();

  beforeEach("", async () => {
    mana = new Mana(MANA_ADDRESS);
    land = new Land(LAND_PROXY_ADDRESS);
    estate = new Estate(ESTATE_ADDRESS);
    marketplace = new Decentraland(MARKETPLACE_ADDRESS);

    assetsForSale = await getAllAssetsForSale();
  });

  it("should get parcels for sale", async () => {
    const parcelsForSale = assetsForSale.filter(isAssetAParcel);
    const { length: parcelsForSaleAmount } = parcelsForSale;

    const parcelsOfSeller = await land.balanceOf(sellerAddress);

    expect(`${parcelsOfSeller}`).to.equal(`${parcelsForSaleAmount}`);
  });

  it("should get estates for sale", async () => {
    const estatesForSale = assetsForSale.filter(isAssetAnEstate);
    const { length: estatesForSaleAmount } = estatesForSale;

    const estatesOfSeller = await estate.balanceOf(sellerAddress);

    expect(`${estatesOfSeller}`).to.equal(`${estatesForSaleAmount}`);
  });

  it("should get assets owned by an address", async () => {
    const estateContractAddress = estate.getAddress();

    const sellerEstateIds = await getEstateIdsOf(sellerAddress);
    const sellerEstateBalance = await estate.balanceOf(sellerAddress);
    const { length: sellerEstateIdsLength } = sellerEstateIds;
    expect(`${sellerEstateIdsLength}`).to.equal(`${sellerEstateBalance}`);

    const sellerParcelIds = await getParcelIdsOf(sellerAddress);
    const sellerParcelBalance = await land.balanceOf(sellerAddress);
    const { length: sellerParcelIdsLength } = sellerParcelIds;
    expect(`${sellerParcelIdsLength}`).to.equal(`${sellerParcelBalance}`);

    const estateParcelIds = await getParcelIdsOf(estateContractAddress);
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
});
