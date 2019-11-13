import { TasitContracts } from "../TasitSdk";
import DecentralandUtils from "../helpers/DecentralandUtils";
import actionHelpers from "tasit-action/dist/testHelpers/helpers";
const {
  addressesAreEqual,
  expectMinimumTokenBalances,
  ProviderFactory,
} = actionHelpers;

const getNetworkName = () => {
  const provider = ProviderFactory.getProvider();
  const { _network: network } = provider;
  const networkName = !network ? "local" : network.name;
  return networkName;
};

export const getContractsAddresses = () => {
  const networkName = getNetworkName();
  const {
    MANAToken,
    LANDProxy,
    EstateRegistry,
    Marketplace,

    GnosisSafe: GnosisSafeInfo,
  } = TasitContracts[networkName];
  const { address: MANA_ADDRESS } = MANAToken;
  const { address: LAND_ADDRESS } = LANDProxy;
  const { address: ESTATE_ADDRESS } = EstateRegistry;
  const { address: MARKETPLACE_ADDRESS } = Marketplace;
  const { address: GNOSIS_SAFE_ADDRESS } = GnosisSafeInfo;

  const addresses = {
    ESTATE_ADDRESS,
    LAND_ADDRESS,
    MARKETPLACE_ADDRESS,
    MANA_ADDRESS,
    GNOSIS_SAFE_ADDRESS,
  };

  return addresses;
};

export const pickAssetsForSale = async () => {
  const { LAND_ADDRESS, ESTATE_ADDRESS } = getContractsAddresses();

  let landForSale;
  let estateForSale;

  const decentralandUtils = new DecentralandUtils();
  const { getAllAssetsForSale } = decentralandUtils;

  const openSellOrders = await getAllAssetsForSale();

  // Note: The exact amount of land isn't predictable since we are forking from the latest block
  expect(openSellOrders).to.not.be.empty;

  // Pick two open sell orders: one for a parcel of land and one for an estate
  for (let order of openSellOrders) {
    const { nftAddress, expiresAt } = order;

    const isLand = addressesAreEqual(nftAddress, LAND_ADDRESS);
    const isEstate = addressesAreEqual(nftAddress, ESTATE_ADDRESS);

    const nowInSeconds = Date.now() / 1000;
    const expired = Number(expiresAt) < nowInSeconds;

    if (isLand && !expired) landForSale = order;
    if (isEstate && !expired) estateForSale = order;

    if (landForSale && estateForSale) break;

    if (!isLand && !isEstate)
      expect(
        false,
        "All land for sale should be an NFT that is either a parcel of land or an estate"
      ).to.equal(true);
  }

  return { landForSale, estateForSale };
};

export const checkAsset = async (
  nftContract,
  erc20Contract,
  assetForSale,
  ownerOfFunds
) => {
  const { MARKETPLACE_ADDRESS } = getContractsAddresses();

  const { assetId, nftAddress, seller, priceInWei, expiresAt } = assetForSale;

  // Asset is the same as expected
  const nftContractAddress = nftContract.getAddress();
  expect(addressesAreEqual(nftAddress, nftContractAddress)).to.be.true;

  // Sell order isn't expired
  const expiresTime = Number(expiresAt);
  const nowInSeconds = Date.now() / 1000;
  expect(nowInSeconds).to.be.below(expiresTime);

  // Buyer (or Owner of funds if buyer is approved) has enough MANA
  await expectMinimumTokenBalances(erc20Contract, [ownerOfFunds], [priceInWei]);

  // Marketplace is approved to transfer Estate or Parcel asset owned by the seller
  const approvedForAsset = await nftContract.getApproved(assetId);
  const approvedForAll = await nftContract.isApprovedForAll(
    seller,
    MARKETPLACE_ADDRESS
  );
  const approved =
    addressesAreEqual(approvedForAsset, MARKETPLACE_ADDRESS) || approvedForAll;
  expect(approved).to.be.true;
};

export const helpers = {
  ...actionHelpers,
  pickAssetsForSale,
  checkAsset,
  getContractsAddresses,
};

export default helpers;
