import { Account, Action, ContractBasedAccount } from "./TasitSdk";
const { ConfigLoader, ERC20, ERC721, Marketplace } = Action;
const { Mana } = ERC20;
const { Estate, Land } = ERC721;
const { Decentraland } = Marketplace;
const { GnosisSafe } = ContractBasedAccount;
import { ethers } from "ethers";

import DecentralandUtils from "./helpers/DecentralandUtils";

const decentralandUtils = new DecentralandUtils();
const { _getEstatesOf, _getParcelsOf, getAssetsOf } = decentralandUtils;

const { ONE, TEN, ONE_HUNDRED } = constants;
const SMALL_AMOUNT = bigNumberify(`${1e17}`); // 0.1 ethers

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
    await expectExactTokenBalances(mana, [ephemeralAddress], [0]);
    await expectExactTokenBalances(land, [ephemeralAddress], [0]);
    await expectExactTokenBalances(estate, [ephemeralAddress], [0]);

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
      });

      beforeEach("check Gnosis Safe balance", async () => {
        gnosisSafe = new GnosisSafe(GNOSIS_SAFE_ADDRESS);

        // Expect an already-funded Gnosis Safe wallet
        await expectMinimumEtherBalances(
          provider,
          [GNOSIS_SAFE_ADDRESS],
          [ONE]
        );

        await expectMinimumTokenBalances(
          mana,
          [GNOSIS_SAFE_ADDRESS],
          [ONE_HUNDRED]
        );

        gnosisSafe.removeWallet();
        gnosisSafe.setSigners([]);
      });

      describe("Using an ephemeral wallet funded by faucets", () => {
        beforeEach("onboarding", done => {
          (async () => {
            const toAddress = ephemeralAddress;

            await etherFaucet(
              provider,
              minterWallet,
              ephemeralAddress,
              SMALL_AMOUNT
            );
            await expectExactEtherBalances(
              provider,
              [ephemeralAddress],
              [SMALL_AMOUNT]
            );
            await erc20Faucet(
              mana,
              minterWallet,
              ephemeralAddress,
              manaAmountForShopping
            );
            await expectExactTokenBalances(
              mana,
              [ephemeralAddress],
              [manaAmountForShopping]
            );

            mana.setWallet(ephemeralWallet);
            const approvalAction = mana.approve(
              MARKETPLACE_ADDRESS,
              manaAmountForShopping
            );

            const errorListener = error => {
              marketplace.off("error");
              done(error);
            };

            const successfulListener = async message => {
              const allowance = await mana.allowance(
                ephemeralAddress,
                MARKETPLACE_ADDRESS
              );
              expect(`${allowance}`).to.equal(`${manaAmountForShopping}`);
              done();
            };

            mana.once("Approval", successfulListener);
            mana.on("error", errorListener);

            approvalAction.send();
          })();
        });

        it("should buy an estate", done => {
          (async () => {
            const {
              assetId,
              nftAddress,
              seller,
              priceInWei,
              expiresAt,
            } = estateForSale;

            await checkAsset(estate, mana, estateForSale, ephemeralAddress);

            await expectExactTokenBalances(estate, [ephemeralAddress], [0]);

            const fingerprint = await estate.getFingerprint(`${assetId}`);

            marketplace.setWallet(ephemeralWallet);
            const executeOrderAction = marketplace.safeExecuteOrder(
              nftAddress,
              `${assetId}`,
              `${priceInWei}`,
              `${fingerprint}`
            );

            const successfulListener = async message => {
              const { data } = message;
              const { args } = data;
              const { buyer } = args;

              expect(buyer).to.equal(ephemeralAddress);
              await expectExactTokenBalances(estate, [ephemeralAddress], [1]);

              done();
            };

            const errorListener = error => {
              marketplace.off("error");
              done(error);
            };

            marketplace.once("OrderSuccessful", successfulListener);
            marketplace.on("error", errorListener);

            executeOrderAction.send();
          })();
        });

        it("should buy a parcel of land", done => {
          (async () => {
            const {
              assetId,
              nftAddress,
              seller,
              priceInWei,
              expiresAt,
            } = landForSale;

            await checkAsset(land, mana, landForSale, ephemeralAddress);

            await expectExactTokenBalances(land, [ephemeralAddress], [0]);

            // LANDRegistry contract doesn't implement getFingerprint function
            const fingerprint = "0x";
            marketplace.setWallet(ephemeralWallet);
            const executeOrderAction = marketplace.safeExecuteOrder(
              nftAddress,
              `${assetId}`,
              `${priceInWei}`,
              `${fingerprint}`
            );

            const successfulListener = sinon.fake(async message => {
              const { data } = message;
              const { args } = data;
              const { buyer } = args;

              expect(buyer).to.equal(ephemeralAddress);
              await expectExactTokenBalances(land, [ephemeralAddress], [1]);

              done();
            });

            const errorListener = sinon.fake(error => {
              marketplace.off("error");
              done(error);
            });

            marketplace.once("OrderSuccessful", successfulListener);
            marketplace.on("error", errorListener);

            executeOrderAction.send();
          })();
        });
      });

      describe("Using an ephemeral wallet funded by a Gnosis Safe wallet", () => {
        beforeEach("onboarding - check Gnosis Safe balance", async () => {
          const { address: gnosisSafeOwnerAddress } = gnosisSafeOwner;

          // Gnosis Safe owner should have enough ethers to pay for the transaction's gas
          await expectMinimumEtherBalances(
            provider,
            [gnosisSafeOwnerAddress],
            [SMALL_AMOUNT]
          );

          // Set wallet and signers
          gnosisSafe.setSigners([gnosisSafeOwner]);
          gnosisSafe.setWallet(gnosisSafeOwner);
        });

        // Transfer a small amount of ethers to ephemeral account to pay for gas
        beforeEach("onboarding - funding ephemeral wallet with ETH", done => {
          (async () => {
            const toAddress = ephemeralAddress;

            const action = gnosisSafe.transferEther(toAddress, SMALL_AMOUNT);

            const confirmationListener = async () => {
              await expectExactEtherBalances(
                provider,
                [toAddress],
                [SMALL_AMOUNT]
              );

              done();
            };

            const errorListener = error => {
              action.off("error");
              done(error);
            };

            action.once("confirmation", confirmationListener);
            action.on("error", errorListener);

            action.send();
          })();
        });

        beforeEach("onboarding - funding ephemeral wallet with MANA", done => {
          (async () => {
            // Global hooks don't run between same level hooks
            await mineBlocks(provider, 1);

            const toAddress = ephemeralAddress;

            const action = gnosisSafe.transferERC20(
              MANA_ADDRESS,
              toAddress,
              manaAmountForShopping
            );

            const confirmationListener = async message => {
              await expectExactTokenBalances(
                mana,
                [toAddress],
                [manaAmountForShopping]
              );
              done();
            };

            const errorListener = error => {
              action.off("error");
              done(error);
            };

            action.once("confirmation", confirmationListener);
            action.on("error", errorListener);

            action.send();
          })();
        });

        beforeEach("onboarding - approving Marketplace to spend MANA", done => {
          (async () => {
            // Global hooks don't run between same level hooks
            await mineBlocks(provider, 1);

            mana.setWallet(ephemeralWallet);
            const action = mana.approve(
              MARKETPLACE_ADDRESS,
              manaAmountForShopping
            );

            const confirmationListener = async message => {
              const allowance = await mana.allowance(
                ephemeralAddress,
                MARKETPLACE_ADDRESS
              );

              expect(`${allowance}`).to.equal(`${manaAmountForShopping}`);
              done();
            };

            const errorListener = error => {
              action.off("error");
              done(error);
            };

            action.once("confirmation", confirmationListener);
            action.on("error", errorListener);

            action.send();
          })();
        });

        it("should buy an estate", done => {
          (async () => {
            const {
              assetId,
              nftAddress,
              seller,
              priceInWei,
              expiresAt,
            } = estateForSale;

            await checkAsset(estate, mana, estateForSale, ephemeralAddress);

            await expectExactTokenBalances(estate, [ephemeralAddress], [0]);

            const fingerprint = await estate.getFingerprint(`${assetId}`);

            marketplace.setWallet(ephemeralWallet);
            const action = marketplace.safeExecuteOrder(
              nftAddress,
              `${assetId}`,
              `${priceInWei}`,
              `${fingerprint}`
            );

            const confirmationListener = async message => {
              await expectExactTokenBalances(estate, [ephemeralAddress], [1]);

              const buyerEstates = await _getEstatesOf(ephemeralAddress);
              const buyerAssets = await getAssetsOf(ephemeralAddress);

              expect(buyerEstates).to.have.lengthOf(1);
              expect(buyerAssets).to.have.lengthOf(1);

              const tx = await action.getTransaction();
              const { hash: purchaseTxHash } = tx;
              const [buyerEstate] = buyerEstates;
              const [buyerAsset] = buyerAssets;
              const { transactionHash: estateTxHash } = buyerEstate;
              const { transactionHash: assetTxHash } = buyerAsset;

              expect(estateTxHash).to.equal(purchaseTxHash);
              expect(assetTxHash).to.equal(purchaseTxHash);

              done();
            };

            const errorListener = error => {
              action.off("error");
              done(error);
            };

            action.once("confirmation", confirmationListener);
            action.on("error", errorListener);

            action.send();
          })();
        });

        it("should buy a parcel of land", done => {
          (async () => {
            const {
              assetId,
              nftAddress,
              seller,
              priceInWei,
              expiresAt,
            } = landForSale;

            await checkAsset(land, mana, landForSale, ephemeralAddress);

            await expectExactTokenBalances(land, [ephemeralAddress], [0]);

            // LANDRegistry contract doesn't implement getFingerprint function
            const fingerprint = "0x";
            marketplace.setWallet(ephemeralWallet);
            const action = marketplace.safeExecuteOrder(
              nftAddress,
              `${assetId}`,
              `${priceInWei}`,
              `${fingerprint}`
            );

            const confirmationListener = async message => {
              await expectExactTokenBalances(land, [ephemeralAddress], [1]);

              const buyerParcels = await _getParcelsOf(ephemeralAddress);
              const buyerAssets = await getAssetsOf(ephemeralAddress);

              expect(buyerParcels).to.have.lengthOf(1);
              expect(buyerAssets).to.have.lengthOf(1);

              const tx = await action.getTransaction();
              const { hash: purchaseTxHash } = tx;
              const [buyerParcel] = buyerParcels;
              const [buyerAsset] = buyerAssets;
              const { transactionHash: parcelTxHash } = buyerParcel;
              const { transactionHash: assetTxHash } = buyerAsset;

              expect(parcelTxHash).to.equal(purchaseTxHash);
              expect(assetTxHash).to.equal(purchaseTxHash);

              done();
            };

            const errorListener = error => {
              action.off("error");
              done(error);
            };

            action.once("confirmation", confirmationListener);
            action.on("error", errorListener);

            action.send();
          })();
        });
      });

      describe("Using funds from a Gnosis Safe wallet", () => {
        beforeEach("onboarding - funding ephemeral account with ETH", done => {
          gnosisSafe.setSigners([gnosisSafeOwner]);
          gnosisSafe.setWallet(gnosisSafeOwner);
          const toAddress = ephemeralAddress;

          // Funding ephemeral account with some ethers to pay for gas
          // TODO: ephemeralWallet should broadcast this action
          const action = gnosisSafe.transferEther(toAddress, SMALL_AMOUNT);

          const confirmationListener = async message => {
            await expectExactEtherBalances(
              provider,
              [toAddress],
              [SMALL_AMOUNT]
            );

            done();
          };

          const errorListener = error => {
            action.off("error");
            done(error);
          };

          action.once("confirmation", confirmationListener);
          action.on("error", errorListener);

          action.send();
        });

        beforeEach("onboarding - approving Marketplace to spend MANA", done => {
          (async () => {
            // Global hooks don't run between same level hooks
            await mineBlocks(provider, 1);
            const toAddress = ephemeralAddress;

            // Gnosis Safe should approve Marketplace to spend its MANA Tokens
            // TODO: ephemeralWallet should broadcast this action
            const contractAddress = mana.getAddress();
            const contractABI = mana.getABI();
            const functionName = "approve";
            const argsArray = [MARKETPLACE_ADDRESS, manaAmountForShopping];
            const action = gnosisSafe.customContractAction(
              contractAddress,
              contractABI,
              functionName,
              argsArray
            );

            const confirmationListener = async message => {
              const owner = GNOSIS_SAFE_ADDRESS;
              const spender = MARKETPLACE_ADDRESS;
              const allowance = await mana.allowance(owner, spender);
              expect(`${allowance}`).to.equal(`${manaAmountForShopping}`);

              done();
            };

            const errorListener = error => {
              action.off("error");
              done(error);
            };

            action.once("confirmation", confirmationListener);
            action.on("error", errorListener);

            action.send();
          })();
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

          await expectExactTokenBalances(estate, [GNOSIS_SAFE_ADDRESS], [0]);

          // Gnosis Safe should execute an open order
          // TODO: ephemeralWallet should broadcast this action
          const contractAddress = marketplace.getAddress();
          const contractABI = marketplace.getABI();
          const functionName = "safeExecuteOrder";
          const fingerprint = await estate.getFingerprint(`${assetId}`);
          const argsArray = [
            nftAddress,
            `${assetId}`,
            `${priceInWei}`,
            `${fingerprint}`,
          ];

          gnosisSafe.setSigners([gnosisSafeOwner]);
          gnosisSafe.setWallet(gnosisSafeOwner);
          const executeOrderAction = gnosisSafe.customContractAction(
            contractAddress,
            contractABI,
            functionName,
            argsArray
          );

          const onFailed = message => {
            const { data } = message;
            const { args } = data;
            const { txHash } = args;
          };
          gnosisSafe.once("ExecutionFailed", onFailed);

          await executeOrderAction.send();
          await executeOrderAction.waitForOneConfirmation();

          await mineBlocks(provider, 1);

          // WIP: Not working because of gas issue on Marketplace.safeExecuteOrder() call
          //await expectExactTokenBalances(estate, [GNOSIS_SAFE_ADDRESS], [1]);
          await expectExactTokenBalances(estate, [GNOSIS_SAFE_ADDRESS], [0]);
        });

        it("should buy a parcel of land", async () => {
          const {
            assetId,
            nftAddress,
            seller,
            priceInWei,
            expiresAt,
          } = landForSale;

          await checkAsset(land, mana, landForSale, GNOSIS_SAFE_ADDRESS);

          await expectExactTokenBalances(land, [GNOSIS_SAFE_ADDRESS], [0]);

          // Gnosis Safe should execute an open order
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

          const onFailed = message => {
            const { data } = message;
            const { args } = data;
            const { txHash } = args;
          };
          gnosisSafe.once("ExecutionFailed", onFailed);

          await executeOrderAction.send();
          await executeOrderAction.waitForOneConfirmation();

          await mineBlocks(provider, 1);

          await executeOrderAction.send();
          await executeOrderAction.waitForOneConfirmation();

          // WIP: Not working because of gas issue on Marketplace.safeExecuteOrder() call
          //await expectExactTokenBalances(land, [GNOSIS_SAFE_ADDRESS], [1]);
          await expectExactTokenBalances(land, [GNOSIS_SAFE_ADDRESS], [0]);
        });
      });

      // Allowance-of-allowance doesn't work
      // See more: https://github.com/tasitlabs/TasitSDK/issues/273
      describe.skip("Using an ephemeral wallet allowed to spend Gnosis Safe wallet's funds", () => {
        beforeEach("onboarding", async () => {
          // Funding ephemeral account with some ethers to pay for gas
          // TODO: ephemeralWallet should broadcast this action
          const toAddress = ephemeralAddress;
          gnosisSafe.setSigners([gnosisSafeOwner]);
          gnosisSafe.setWallet(gnosisSafeOwner);
          const transferEthersAction = gnosisSafe.transferEther(
            toAddress,
            SMALL_AMOUNT
          );
          await transferEthersAction.send();
          await transferEthersAction.waitForOneConfirmation();
          await expectExactEtherBalances(provider, [toAddress], [SMALL_AMOUNT]);

          // Gnosis Safe should approve ephemeral account to spend its MANA Tokens
          // TODO: ephemeralWallet should broadcast this action
          const contractAddress = mana.getAddress();
          const contractABI = mana.getABI();
          const functionName = "approve";
          const spender = ephemeralAddress;
          const argsArray = [spender, manaAmountForShopping];
          gnosisSafe.setSigners([gnosisSafeOwner]);
          gnosisSafe.setWallet(gnosisSafeOwner);
          const ephemeralApprovalAction = gnosisSafe.customContractAction(
            contractAddress,
            contractABI,
            functionName,
            argsArray
          );
          await ephemeralApprovalAction.send();
          await ephemeralApprovalAction.waitForOneConfirmation();
          const owner = GNOSIS_SAFE_ADDRESS;
          const ephemeralAllowance = await mana.allowance(owner, spender);
          expect(`${ephemeralAllowance}`).to.equal(`${manaAmountForShopping}`);

          // Ephemeral account approves Marketplace to spend their mana tokens (actually tokens from Gnosis Safe).
          mana.setWallet(ephemeralWallet);
          const marketplaceApprovalAction = mana.approve(
            MARKETPLACE_ADDRESS,
            manaAmountForShopping
          );
          await marketplaceApprovalAction.send();
          await marketplaceApprovalAction.waitForOneConfirmation();
          const marketplaceAllowance = await mana.allowance(
            ephemeralAddress,
            MARKETPLACE_ADDRESS
          );
          expect(`${marketplaceAllowance}`).to.equal(
            `${manaAmountForShopping}`
          );
        });

        it("should buy an estate", async () => {
          const {
            assetId,
            nftAddress,
            seller,
            priceInWei,
            expiresAt,
          } = estateForSale;

          await checkAsset(estate, mana, estateForSale, GNOSIS_SAFE_ADDRESS);
          await expectExactTokenBalances(estate, [ephemeralAddress], [0]);

          const fingerprint = await estate.getFingerprint(`${assetId}`);

          marketplace.setWallet(ephemeralWallet);
          const executeOrderAction = marketplace.safeExecuteOrder(
            nftAddress,
            `${assetId}`,
            `${priceInWei}`,
            `${fingerprint}`
          );

          await executeOrderAction.send();
          await executeOrderAction.waitForOneConfirmation();

          await expectExactTokenBalances(estate, [ephemeralAddress], [1]);
        });

        it("should buy a parcel of land", async () => {
          const {
            assetId,
            nftAddress,
            seller,
            priceInWei,
            expiresAt,
          } = landForSale;

          await checkAsset(land, mana, landForSale, GNOSIS_SAFE_ADDRESS);

          await expectExactTokenBalances(land, [ephemeralAddress], [0]);

          // LANDRegistry contract doesn't implement getFingerprint function
          const fingerprint = "0x";
          marketplace.setWallet(ephemeralWallet);
          const executeOrderAction = marketplace.safeExecuteOrder(
            nftAddress,
            `${assetId}`,
            `${priceInWei}`,
            `${fingerprint}`
          );

          await executeOrderAction.send();
          await executeOrderAction.waitForOneConfirmation();

          await expectExactTokenBalances(land, [ephemeralAddress], [1]);
        });
      });
    });
  });
});
