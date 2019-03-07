import { Account, Action } from "./TasitSdk";
const { ERC20, ERC721, Marketplace: MarketplaceContracts } = Action;
const { Mana } = ERC20;
const { Estate, Land } = ERC721;
const { Decentraland } = MarketplaceContracts;
import TasitContracts from "../../tasit-contracts/dist";
const { local } = TasitContracts;
const { MANAToken, LANDProxy, EstateRegistry, Marketplace } = local;
const { address: MANA_ADDRESS } = MANAToken;
const { address: LAND_PROXY_ADDRESS } = LANDProxy;
const { address: ESTATE_ADDRESS } = EstateRegistry;
const { address: MARKETPLACE_ADDRESS } = Marketplace;

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
  let landTotalSupply;

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
    manaContract = new Mana(MANA_ADDRESS, ownerWallet);
    landContract = new Land(LAND_PROXY_ADDRESS, ownerWallet);
    estateContract = new Estate(ESTATE_ADDRESS, ownerWallet);
    marketplaceContract = new Decentraland(MARKETPLACE_ADDRESS, ownerWallet);

    landTotalSupply = await landContract.totalSupply();

    await confirmBalances(landContract, [sellerWallet.address], [0]);

    await confirmBalances(
      estateContract,
      [sellerWallet.address],
      [landTotalSupply]
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
        [0, landTotalSupply]
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
        [1, Number(landTotalSupply) - 1]
      );
    });

    describe("Decentraland tasit app test cases", () => {
      beforeEach("remove wallets from contracts", async () => {
        manaContract.removeWallet();
        landContract.removeWallet();
        estateContract.removeWallet();
        marketplaceContract.removeWallet();
      });

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
