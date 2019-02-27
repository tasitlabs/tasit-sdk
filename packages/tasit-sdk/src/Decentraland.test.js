import { Account, Action } from "./TasitSdk";
const { Contract, ERC721 } = Action;

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
  let estateIds;

  before("", async () => {
    [ownerWallet, sellerWallet, buyerWallet] = accounts;
    ephemeralWallet = Account.create();

    expect(ownerWallet.address).to.have.lengthOf(42);
    expect(sellerWallet.address).to.have.lengthOf(42);
    expect(buyerWallet.address).to.have.lengthOf(42);
    expect(ephemeralWallet.address).to.have.lengthOf(42);
  });

  beforeEach("", async () => {
    // Note: In future we can have other ERC20 than Mana to test the Marketplace orders
    ({
      manaContract,
      landContract,
      estateContract,
      marketplaceContract,
    } = await setupContracts(ownerWallet));

    const parcels = [
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 0, y: 5 },
    ];

    // Note: Often estates have more than one parcel of land in them
    // but here we just have one parcel of land in each to keep this test short
    estateIds = await createEstatesFromParcels(
      estateContract,
      landContract,
      parcels,
      sellerWallet
    );

    const estateData = await estateContract.getMetadata(estateIds[0]);
    expect(estateData).to.equal(`cool estate ${parcels[0].x}x${parcels[0].y}`);

    const totalSupply = await landContract.totalSupply();
    expect(totalSupply.toNumber()).to.equal(parcels.length);

    // After became part of an estate, parcels are no more accounted as LAND balance
    await confirmBalances(landContract, [sellerWallet.address], [0]);

    await confirmBalances(
      estateContract,
      [sellerWallet.address],
      [estateIds.length]
    );

    await mineBlocks(provider, 1);
  });

  describe("Marketplace", () => {
    // TODO: Assign different contract objects for each wallet (avoiding setWallet)
    beforeEach(
      "buyer and seller approve marketplace contract to transfer tokens on their behalf",
      async () => {
        const { address: buyerAddress } = buyerWallet;
        erc20Faucet(manaContract, ownerWallet, buyerAddress, TEN);

        manaContract.setWallet(buyerWallet);
        const marketplaceApprovalByBuyer = manaContract.approve(
          marketplaceContract.getAddress(),
          ONE.toString()
        );
        await marketplaceApprovalByBuyer.waitForNonceToUpdate();

        estateContract.setWallet(sellerWallet);
        const marketplaceApprovalBySeller = estateContract.setApprovalForAll(
          marketplaceContract.getAddress(),
          true,
          gasParams
        );
        await marketplaceApprovalBySeller.waitForNonceToUpdate();
      }
    );

    it("should execute an order", async () => {
      const { address: buyerAddress } = buyerWallet;
      const { address: sellerAddress } = sellerWallet;

      await confirmBalances(
        estateContract,
        [buyerAddress, sellerAddress],
        [0, estateIds.length]
      );

      const assetId = 1;
      const priceInWei = ONE.toString();
      const expireAt = Date.now() + duration.hours(1);

      marketplaceContract.setWallet(sellerWallet);
      const createOrder = marketplaceContract.createOrder(
        estateContract.getAddress(),
        assetId,
        priceInWei,
        expireAt,
        gasParams
      );
      await createOrder.waitForNonceToUpdate();

      marketplaceContract.setWallet(buyerWallet);
      const fingerprint = await estateContract.getFingerprint(assetId);
      const executeOrder = marketplaceContract.safeExecuteOrder(
        estateContract.getAddress(),
        assetId,
        priceInWei,
        fingerprint.toString(),
        gasParams
      );
      await executeOrder.waitForNonceToUpdate();

      await confirmBalances(
        estateContract,
        [buyerAddress, sellerAddress],
        [1, estateIds.length - 1]
      );
    });

    describe("Decentraland tasit app test cases", () => {
      beforeEach(
        "create sell orders and remove wallets from contracts",
        async () => {
          marketplaceContract.setWallet(sellerWallet);
          for (let assetId of estateIds) {
            const priceInWei = ONE.toString();
            const expireAt = Date.now() + duration.years(1);
            const createOrder = marketplaceContract.createOrder(
              estateContract.getAddress(),
              assetId,
              priceInWei,
              expireAt,
              gasParams
            );
            await createOrder.waitForNonceToUpdate();
          }

          manaContract.removeWallet();
          landContract.removeWallet();
          estateContract.removeWallet();
          marketplaceContract.removeWallet();
        }
      );

      it("should list marketplace estates sell orders (without wallet)", async () => {
        const orders = [];
        const totalSupply = await estateContract.totalSupply();

        // create an array 1..N, where N = total of estates
        const allEstatesIds = [...Array(totalSupply.toNumber())].map(
          (val, key) => key + 1
        );

        for (let estateId of allEstatesIds) {
          const order = await getEstateSellOrder(
            marketplaceContract,
            estateContract,
            estateId
          );
          orders.push(order);
        }

        expect(orders).to.not.deep.include(null);
      });

      // Note: If Decentraland were leveraging ERC721Metadata token URI's more,
      // we would have done expectations on them in this test
      it("should get an estate info (without wallet)", async () => {
        const estateId = 5;
        const order = await getEstateSellOrder(
          marketplaceContract,
          estateContract,
          estateId
        );

        expect(order.estateName).to.equal("cool estate 0x5");
        expect(order.price.toString()).to.equal(ONE.toString());
      });

      it("should buy an estate", async () => {
        const { address: ephemeralAddress } = ephemeralWallet;
        await erc20Faucet(manaContract, ownerWallet, ephemeralAddress, TEN);
        await etherFaucet(provider, ownerWallet, ephemeralWallet.address, ONE);

        manaContract.setWallet(ephemeralWallet);
        const marketplaceApproval = manaContract.approve(
          marketplaceContract.getAddress(),
          ONE.toString()
        );
        await marketplaceApproval.waitForNonceToUpdate();

        const assetId = 1;
        const priceInWei = ONE.toString();

        marketplaceContract.setWallet(ephemeralWallet);
        const fingerprint = await estateContract.getFingerprint(assetId);
        const executeOrder = marketplaceContract.safeExecuteOrder(
          estateContract.getAddress(),
          assetId,
          priceInWei,
          fingerprint.toString(),
          gasParams
        );
        await executeOrder.waitForNonceToUpdate();

        await confirmBalances(estateContract, [ephemeralAddress], [1]);
      });
    });
  });
});
