import { Account, Action } from "./TasitSdk";
const { ConfigLoader, ERC20, ERC721, Marketplace: marketplaces } = Action;
const { Mana } = ERC20;
const { Estate, Land } = ERC721;
const { Decentraland } = marketplaces;

const { ONE, TEN } = constants;

describe("Decentraland", () => {
  let minterWallet;
  let ephemeralWallet;
  let ephemeralAddress;
  let mana;
  let land;
  let estate;
  let marketplace;
  let landForSale;
  let estateForSale;

  // TODO: Assign different contract objects for each wallet (avoiding setWallet)
  before("", async () => {
    [minterWallet] = accounts;
    ephemeralWallet = Account.create();
    ({ address: ephemeralAddress } = ephemeralWallet);

    // Note: In future we can have other ERC20 than Mana to test the Marketplace orders
    mana = new Mana(MANA_ADDRESS);
    land = new Land(LAND_PROXY_ADDRESS);
    estate = new Estate(ESTATE_ADDRESS);
    marketplace = new Decentraland(MARKETPLACE_ADDRESS);

    ({ landForSale, estateForSale } = await pickAssetsForSale());

    expect(estateForSale).not.to.be.an("undefined");
    expect(landForSale).not.to.be.an("undefined");
  });

  beforeEach("", async () => {
    await confirmBalances(mana, [ephemeralAddress], [0]);
    await confirmBalances(land, [ephemeralAddress], [0]);
    await confirmBalances(estate, [ephemeralAddress], [0]);

    mana.removeWallet();
    land.removeWallet();
    estate.removeWallet();
    marketplace.removeWallet();
  });

  describe("Marketplace", () => {
    describe("read-only / without wallet test cases", () => {
      // Note: If Decentraland were leveraging ERC721Metadata token URI's more,
      // we would have done expectations on them in this test
      it("should get land for sale info", async () => {
        const { assetId } = landForSale;

        const metadataPromise = land.tokenMetadata(assetId);
        const coordsPromise = land.decodeTokenId(assetId);
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

        const metadataPromise = estate.getMetadata(assetId);
        const sizePromise = estate.getEstateSize(assetId);
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
      let manaAmountForShopping;

      beforeEach("", async () => {
        const { priceInWei: landPrice } = landForSale;
        const { priceInWei: estatePrice } = estateForSale;

        manaAmountForShopping = bigNumberify(landPrice).add(
          bigNumberify(estatePrice)
        );
      });

      describe("Using a Gnosis Safe wallet to buy assets", () => {
        let gnosisSafe;
        before("", async () => {
          gnosisSafe = new GnosisSafe(GNOSIS_SAFE_ADDRESS);
        });

        beforeEach("onboarding", async () => {
          gnosisSafe.removeWallet();
          gnosisSafe.setSigners([]);

          await etherFaucet(provider, minterWallet, ephemeralAddress, ONE);
          await confirmEtherBalances(provider, [ephemeralAddress], [ONE]);

          await erc20Faucet(
            mana,
            minterWallet,
            ephemeralAddress,
            manaAmountForShopping
          );

          await confirmBalances(
            mana,
            [ephemeralAddress],
            [manaAmountForShopping]
          );

          mana.setWallet(ephemeralWallet);
          const approvalAction = mana.approve(
            MARKETPLACE_ADDRESS,
            manaAmountForShopping,
            gasParams
          );
          await approvalAction.waitForNonceToUpdate();

          const allowance = await mana.allowance(
            ephemeralAddress,
            MARKETPLACE_ADDRESS
          );

          expect(`${allowance}`).to.equal(`${manaAmountForShopping}`);
        });

        it("should buy an estate", async () => {
          const {
            assetId,
            nftAddress,
            seller,
            priceInWei,
            expiresAt,
          } = estateForSale;

          checkAsset(estate, mana, estateForSale, ephemeralAddress);

          await confirmBalances(estate, [ephemeralAddress], [0]);

          const fingerprint = await estate.getFingerprint(assetId.toString());

          marketplace.setWallet(ephemeralWallet);
          const executeOrderAction = marketplace.safeExecuteOrder(
            nftAddress,
            `${assetId}`,
            `${priceInWei}`,
            `${fingerprint}`,
            gasParams
          );

          await executeOrderAction.waitForNonceToUpdate();

          await confirmBalances(estate, [ephemeralAddress], [1]);
        });

        it("should buy a parcel of land", async () => {
          const {
            assetId,
            nftAddress,
            seller,
            priceInWei,
            expiresAt,
          } = landForSale;

          checkAsset(land, mana, landForSale, ephemeralAddress);

          await confirmBalances(land, [ephemeralAddress], [0]);

          // LANDRegistry contract doesn't implement getFingerprint function
          const fingerprint = "0x";
          marketplace.setWallet(ephemeralWallet);
          const executeOrderAction = marketplace.safeExecuteOrder(
            nftAddress,
            `${assetId}`,
            `${priceInWei}`,
            `${fingerprint}`,
            gasParams
          );

          await executeOrderAction.waitForNonceToUpdate();

          await confirmBalances(land, [ephemeralAddress], [1]);
        });
      });

      describe.skip("Using a funded ephemeral wallet to buy assets", () => {
        beforeEach("onboarding", async () => {
          await etherFaucet(provider, minterWallet, ephemeralAddress, ONE);
          await confirmEtherBalances(provider, [ephemeralAddress], [ONE]);

          await erc20Faucet(
            mana,
            minterWallet,
            ephemeralAddress,
            manaAmountForShopping
          );

          await confirmBalances(
            mana,
            [ephemeralAddress],
            [manaAmountForShopping]
          );

          mana.setWallet(ephemeralWallet);
          const approvalAction = mana.approve(
            MARKETPLACE_ADDRESS,
            manaAmountForShopping,
            gasParams
          );
          await approvalAction.waitForNonceToUpdate();

          const allowance = await mana.allowance(
            ephemeralAddress,
            MARKETPLACE_ADDRESS
          );

          expect(`${allowance}`).to.equal(`${manaAmountForShopping}`);
        });

        it("should buy an estate", async () => {
          const {
            assetId,
            nftAddress,
            seller,
            priceInWei,
            expiresAt,
          } = estateForSale;

          checkAsset(estate, mana, estateForSale, ephemeralAddress);

          await confirmBalances(estate, [ephemeralAddress], [0]);

          const fingerprint = await estate.getFingerprint(assetId.toString());

          marketplace.setWallet(ephemeralWallet);
          const executeOrderAction = marketplace.safeExecuteOrder(
            nftAddress,
            `${assetId}`,
            `${priceInWei}`,
            `${fingerprint}`,
            gasParams
          );

          await executeOrderAction.waitForNonceToUpdate();

          await confirmBalances(estate, [ephemeralAddress], [1]);
        });

        it("should buy a parcel of land", async () => {
          const {
            assetId,
            nftAddress,
            seller,
            priceInWei,
            expiresAt,
          } = landForSale;

          checkAsset(land, mana, landForSale, ephemeralAddress);

          await confirmBalances(land, [ephemeralAddress], [0]);

          // LANDRegistry contract doesn't implement getFingerprint function
          const fingerprint = "0x";
          marketplace.setWallet(ephemeralWallet);
          const executeOrderAction = marketplace.safeExecuteOrder(
            nftAddress,
            `${assetId}`,
            `${priceInWei}`,
            `${fingerprint}`,
            gasParams
          );

          await executeOrderAction.waitForNonceToUpdate();

          await confirmBalances(land, [ephemeralAddress], [1]);
        });
      });
    });
  });
});
