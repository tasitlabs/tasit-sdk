import { Account, Action, ContractBasedAccount } from "./TasitSdk";
const { ConfigLoader, ERC20, ERC721, Marketplace: marketplaces } = Action;
const { Mana } = ERC20;
const { Estate, Land } = ERC721;
const { Decentraland } = marketplaces;
const { GnosisSafe } = ContractBasedAccount;
import { ethers } from "ethers";

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
      const gnosisSafeOwner = accounts[9];
      let gnosisSafe;

      beforeEach("", async () => {
        const { priceInWei: landPrice } = landForSale;
        const { priceInWei: estatePrice } = estateForSale;

        manaAmountForShopping = bigNumberify(landPrice).add(
          bigNumberify(estatePrice)
        );

        gnosisSafe = new GnosisSafe(GNOSIS_SAFE_ADDRESS);

        await etherFaucet(provider, minterWallet, GNOSIS_SAFE_ADDRESS, TEN);
        await confirmEtherBalances(provider, [GNOSIS_SAFE_ADDRESS], [TEN]);

        await erc20Faucet(mana, minterWallet, GNOSIS_SAFE_ADDRESS, TEN);
        await confirmBalances(mana, [GNOSIS_SAFE_ADDRESS], [TEN]);
      });

      describe("Using a funded ephemeral wallet to buy assets", () => {
        beforeEach("onboarding", async () => {
          gnosisSafe.setSigners([gnosisSafeOwner]);
          gnosisSafe.setWallet(gnosisSafeOwner);

          const toAddress = ephemeralAddress;

          // Transfer a small amount of ethers do ephemeral account pay for gas
          const transferEthersAction = gnosisSafe.transferEther(toAddress, ONE);
          await transferEthersAction.waitForNonceToUpdate();
          await confirmEtherBalances(provider, [toAddress], [ONE]);

          const transferManaAction = gnosisSafe.transferERC20(
            MANA_ADDRESS,
            toAddress,
            manaAmountForShopping
          );
          await transferManaAction.waitForNonceToUpdate();
          await confirmBalances(mana, [toAddress], [manaAmountForShopping]);

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

      // Note: Not working because of gas issue on Marketplace.safeExecuteOrder() call
      describe.skip("Using a Gnosis Safe wallet to buy assets", () => {
        beforeEach("onboarding", async () => {
          // Funding ephemeral account with some ethers to pay for gas
          // TODO: Replace ONE -> SMALL_AMONT (0.1)
          // TODO: ephemeralWallet should broadcast this action
          const toAddress = ephemeralAddress;
          gnosisSafe.setSigners([gnosisSafeOwner]);
          gnosisSafe.setWallet(gnosisSafeOwner);
          const transferEthersAction = gnosisSafe.transferEther(toAddress, ONE);
          await transferEthersAction.waitForNonceToUpdate();
          await confirmEtherBalances(provider, [toAddress], [ONE]);

          // Gnosis Safe should approve Marketplace to spend its MANA Tokens
          // TODO: ephemeralWallet should broadcast this action
          const contractAddress = mana.getAddress();
          const contractABI = mana.getABI();
          const functionName = "approve";
          const argsArray = [MARKETPLACE_ADDRESS, manaAmountForShopping];
          const ethersAmount = "0";
          gnosisSafe.setSigners([gnosisSafeOwner]);
          gnosisSafe.setWallet(gnosisSafeOwner);
          const approvalAction = gnosisSafe.customContractAction(
            contractAddress,
            contractABI,
            functionName,
            argsArray,
            ethersAmount
          );
          await approvalAction.waitForNonceToUpdate();

          const owner = GNOSIS_SAFE_ADDRESS;
          const spender = MARKETPLACE_ADDRESS;
          const allowance = await mana.allowance(owner, spender);
          expect(`${allowance}`).to.equal(`${manaAmountForShopping}`);

          gnosisSafe.removeWallet();
          gnosisSafe.setSigners([]);
        });

        it("should buy an estate", async () => {
          const {
            assetId,
            nftAddress,
            seller,
            priceInWei,
            expiresAt,
          } = estateForSale;

          const buyerAddress = GNOSIS_SAFE_ADDRESS;
          await checkAsset(estate, mana, estateForSale, buyerAddress);

          await confirmBalances(estate, [GNOSIS_SAFE_ADDRESS], [0]);

          // Gnosis Safe should approve Marketplace to spend its MANA Tokens
          // TODO: ephemeralWallet should broadcast this action
          const contractAddress = marketplace.getAddress();
          const contractABI = marketplace.getABI();
          const functionName = "safeExecuteOrder";
          const fingerprint = await estate.getFingerprint(assetId.toString());
          const argsArray = [
            nftAddress,
            `${assetId}`,
            `${priceInWei}`,
            `${fingerprint}`,
          ];
          const ethersAmount = "0";
          gnosisSafe.setSigners([gnosisSafeOwner]);
          gnosisSafe.setWallet(gnosisSafeOwner);
          const executeOrderAction = gnosisSafe.customContractAction(
            contractAddress,
            contractABI,
            functionName,
            argsArray,
            ethersAmount
          );

          gnosisSafe.once("ExecutionFailed", console.log);

          await executeOrderAction.waitForNonceToUpdate();

          await mineBlocks(provider, 1);

          await confirmBalances(estate, [GNOSIS_SAFE_ADDRESS], [1]);
        });

        it("should buy a parcel of land", async () => {
          const {
            assetId,
            nftAddress,
            seller,
            priceInWei,
            expiresAt,
          } = landForSale;

          checkAsset(land, mana, landForSale, GNOSIS_SAFE_ADDRESS);

          await confirmBalances(land, [GNOSIS_SAFE_ADDRESS], [0]);

          // Gnosis Safe should approve Marketplace to spend its MANA Tokens
          // TODO: ephemeralWallet should broadcast this action
          const contractAddress = marketplace.getAddress();
          const contractABI = marketplace.getABI();
          const functionName = "safeExecuteOrder";
          // LANDRegistry contract doesn't implement getFingerprint function
          const fingerprint = "0x";
          const argsArray = [
            nftAddress,
            `${assetId}`,
            `${priceInWei}`,
            `${fingerprint}`,
          ];
          const ethersAmount = "0";
          gnosisSafe.setSigners([gnosisSafeOwner]);
          gnosisSafe.setWallet(gnosisSafeOwner);
          const executeOrderAction = gnosisSafe.customContractAction(
            contractAddress,
            contractABI,
            functionName,
            argsArray,
            ethersAmount
          );

          gnosisSafe.once("ExecutionFailed", console.log);

          await executeOrderAction.waitForNonceToUpdate();

          await mineBlocks(provider, 1);

          await executeOrderAction.waitForNonceToUpdate();

          await confirmBalances(land, [GNOSIS_SAFE_ADDRESS], [1]);
        });
      });
    });
  });
});
