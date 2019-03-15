import { Account, Action } from "./TasitSdk";
const {
  ConfigLoader,
  ERC20,
  ERC721,
  Marketplace: MarketplaceContracts,
} = Action;
const { Mana } = ERC20;
const { Estate, Land } = ERC721;
const { Decentraland } = MarketplaceContracts;

const { ONE, TEN } = constants;

describe("Decentraland", () => {
  let ownerWallet;
  let sellerWallet;
  let buyerWallet;
  let ephemeralWallet;
  let manaContract;
  let landContract;
  let estateContract;
  let marketplaceContract;
  let landForSale;
  let estateForSale;

  // TODO: Assign different contract objects for each wallet (avoiding setWallet)
  before("", async () => {
    [ownerWallet, sellerWallet, buyerWallet] = accounts;
    ephemeralWallet = Account.create();

    // Note: In future we can have other ERC20 than Mana to test the Marketplace orders
    manaContract = new Mana(MANA_ADDRESS);
    landContract = new Land(LAND_PROXY_ADDRESS);
    estateContract = new Estate(ESTATE_ADDRESS);
    marketplaceContract = new Decentraland(MARKETPLACE_ADDRESS);

    ({ landForSale, estateForSale } = await pickAssetsForSale());

    expect(estateForSale).not.to.be.an("undefined");
    expect(landForSale).not.to.be.an("undefined");
  });

  beforeEach("", async () => {
    const { address: ephemeralAddress } = ephemeralWallet;

    await confirmBalances(manaContract, [ephemeralAddress], [0]);
    await confirmBalances(landContract, [ephemeralAddress], [0]);
    await confirmBalances(estateContract, [ephemeralAddress], [0]);

    manaContract.removeWallet();
    landContract.removeWallet();
    estateContract.removeWallet();
    marketplaceContract.removeWallet();
  });

  describe("Marketplace", () => {
    describe("read-only / without wallet test cases", () => {
      // Note: If Decentraland were leveraging ERC721Metadata token URI's more,
      // we would have done expectations on them in this test
      it("should get land for sale info", async () => {
        const { assetId } = landForSale;

        const metadataPromise = landContract.tokenMetadata(assetId);
        const coordsPromise = landContract.decodeTokenId(assetId);
        const [metadata, coords] = await Promise.all([
          metadataPromise,
          coordsPromise,
        ]);

        // Note: Metadata could be an empty string
        expect(metadata).to.not.be.null;
        if (metadata === "")
          console.log(`Land parcel id ${assetId} with empty metadata.`);

        const [x, y] = coords;
        expect(coords).to.not.include(null);
        expect(x.toNumber()).to.be.a("number");
        expect(y.toNumber()).to.be.a("number");
      });

      // Note: If Decentraland were leveraging ERC721Metadata token URI's more,
      // we would have done expectations on them in this test
      it("should get info about the estate for sale", async () => {
        const { assetId } = estateForSale;

        const metadataPromise = estateContract.getMetadata(assetId);
        const sizePromise = estateContract.getEstateSize(assetId);
        const [metadata, size] = await Promise.all([
          metadataPromise,
          sizePromise,
        ]);

        // Note: Metadata could be an empty string
        expect(metadata).to.not.be.null;
        if (metadata === "")
          console.log(`Estate id ${assetId} with empty metadata.`);

        expect(size.toNumber()).to.be.a("number");
        expect(size.toNumber()).to.be.at.least(0);
      });
    });

    describe("write / with wallet test cases", () => {
      beforeEach(
        "buyer and seller approve marketplace contract to transfer tokens on their behalf",
        async () => {
          const { address: ephemeralAddress } = ephemeralWallet;

          const { priceInWei: landPrice } = landForSale;
          const { priceInWei: estatePrice } = estateForSale;

          const manaAmountForShopping = bigNumberify(landPrice).add(
            bigNumberify(estatePrice)
          );

          await etherFaucet(provider, ownerWallet, ephemeralAddress, ONE);
          await confirmEtherBalances(provider, [ephemeralAddress], [ONE]);

          await erc20Faucet(
            manaContract,
            ownerWallet,
            ephemeralAddress,
            manaAmountForShopping
          );

          await confirmBalances(
            manaContract,
            [ephemeralAddress],
            [manaAmountForShopping]
          );

          manaContract.setWallet(ephemeralWallet);
          const approvalAction = manaContract.approve(
            MARKETPLACE_ADDRESS,
            manaAmountForShopping,
            gasParams
          );
          await approvalAction.waitForNonceToUpdate();

          const allowance = await manaContract.allowance(
            ephemeralAddress,
            MARKETPLACE_ADDRESS
          );

          expect(`${allowance}`).to.equal(`${manaAmountForShopping}`);
        }
      );

      it("should buy an estate", async () => {
        const {
          assetId,
          nftAddress,
          seller,
          priceInWei,
          expiresAt,
        } = estateForSale;

        const { address: ephemeralAddress } = ephemeralWallet;

        checkAsset(
          estateContract,
          manaContract,
          estateForSale,
          ephemeralAddress
        );

        await confirmBalances(estateContract, [ephemeralAddress], [0]);

        const fingerprint = await estateContract.getFingerprint(
          assetId.toString()
        );

        marketplaceContract.setWallet(ephemeralWallet);
        const executeOrderAction = marketplaceContract.safeExecuteOrder(
          nftAddress,
          `${assetId}`,
          `${priceInWei}`,
          `${fingerprint}`,
          gasParams
        );

        await executeOrderAction.waitForNonceToUpdate();

        await confirmBalances(estateContract, [ephemeralAddress], [1]);
      });

      it("should buy a parcel of land", async () => {
        const {
          assetId,
          nftAddress,
          seller,
          priceInWei,
          expiresAt,
        } = landForSale;

        const { address: ephemeralAddress } = ephemeralWallet;

        checkAsset(landContract, manaContract, landForSale, ephemeralAddress);

        await confirmBalances(landContract, [ephemeralAddress], [0]);

        // LANDRegistry contract doesn't implement getFingerprint function
        const fingerprint = "0x";
        marketplaceContract.setWallet(ephemeralWallet);
        const executeOrderAction = marketplaceContract.safeExecuteOrder(
          nftAddress,
          `${assetId}`,
          `${priceInWei}`,
          `${fingerprint}`,
          gasParams
        );

        await executeOrderAction.waitForNonceToUpdate();

        await confirmBalances(landContract, [ephemeralAddress], [1]);
      });
    });
  });
});
