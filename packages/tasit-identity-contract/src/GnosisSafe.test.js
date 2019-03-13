import Action from "tasit-action";
const { ERC20, ERC721 } = Action;
const { ERC20Full } = ERC20;
const { ERC721Full } = ERC721;
import GnosisSafe from "./GnosisSafe";
import Account from "../../tasit-account/dist";
import TasitContracts from "tasit-contracts";
const { local } = TasitContracts;
const { GnosisSafe: GnosisSafeInfo, MyERC20Full, MyERC721Full } = local;
const { address: GNOSIS_SAFE_ADDRESS } = GnosisSafeInfo;
const { address: ERC20_ADDRESS } = MyERC20Full;
const { address: NFT_ADDRESS } = MyERC721Full;

const { ZERO, ONE } = constants;
const SMALL_AMOUNT = bigNumberify(`${1e17}`); // 0.1 ethers

describe("GnosisSafe", () => {
  let gnosisSafe;
  let root;
  let johnWallet;
  let ephemeralWallet;
  let erc20;
  let nft;

  before("", async () => {
    // That account is funded with ethers and is owner of all token contracts deployed
    [root] = accounts;
    johnWallet = accounts[9];
    ephemeralWallet = Account.create();

    // Contract deployment setup with john (accounts[9]) as the only owner
    // To change that, edit the file "tasit-contract/3rd-parties/gnosis/scripts/2_deploy_contracts.js"
    gnosisSafe = new GnosisSafe(GNOSIS_SAFE_ADDRESS);

    erc20 = new ERC20Full(ERC20_ADDRESS);

    nft = new ERC721Full(NFT_ADDRESS);
  });

  beforeEach("", async () => {
    const etherBalance = await provider.getBalance(GNOSIS_SAFE_ADDRESS);
    expect(`${etherBalance}`).to.equal(`${ZERO}`);

    const erc20Balance = await erc20.balanceOf(GNOSIS_SAFE_ADDRESS);
    expect(`${erc20Balance}`).to.equal(`${ZERO}`);

    gnosisSafe.setSigners([]);
    gnosisSafe.removeWallet();
    erc20.removeWallet();
  });

  afterEach("", async () => {
    expect(erc20.subscribedEventNames()).to.be.empty;
    expect(gnosisSafe.subscribedEventNames()).to.be.empty;
    expect(provider._events).to.be.empty;
  });

  describe("test cases that needs ETH deposit to the wallet", async () => {
    beforeEach("faucet", async () => {
      await etherFaucet(provider, root, GNOSIS_SAFE_ADDRESS, ONE);
      const balance = await provider.getBalance(GNOSIS_SAFE_ADDRESS);
      expect(`${balance}`).to.equal(`${ONE}`);
    });

    it("contract account should send ethers back to owner", async () => {
      const { address: toAddress } = johnWallet;
      const value = ONE;

      gnosisSafe.setSigners([johnWallet]);
      gnosisSafe.setWallet(johnWallet);
      const execTxAction = gnosisSafe.transferEther(toAddress, value);
      await execTxAction.waitForNonceToUpdate();

      const balance = await provider.getBalance(GNOSIS_SAFE_ADDRESS);
      expect(`${balance}`).to.equal(`${ZERO}`);
    });

    describe("test cases with more than one signer", () => {
      beforeEach("wallet owner should add an account as signer", async () => {
        const { address: johnAddress } = johnWallet;

        const ownersBefore = await gnosisSafe.getOwners();
        expect(ownersBefore).deep.equal([johnAddress]);

        const thresholdBefore = await gnosisSafe.getThreshold();
        expect(`${thresholdBefore}`).to.equal(`1`);

        const { address: newSignerAddress } = ephemeralWallet;
        const newThreshold = `2`;

        gnosisSafe.setSigners([johnWallet]);
        gnosisSafe.setWallet(johnWallet);
        const action = gnosisSafe.addSignerWithThreshold(
          newSignerAddress,
          newThreshold
        );
        await action.waitForNonceToUpdate();

        const ownersAfter = await gnosisSafe.getOwners();
        expect(ownersAfter).deep.equal([newSignerAddress, johnAddress]);

        const thresholdAfter = await gnosisSafe.getThreshold();
        expect(`${thresholdAfter}`).to.equal(`2`);
      });

      it("shouldn't be able to execute transfer with insufficient signers", async () => {
        const onError = sinon.fake();
        const balanceBefore = await provider.getBalance(GNOSIS_SAFE_ADDRESS);
        const { address: toAddress } = johnWallet;
        const value = ONE;

        gnosisSafe.setSigners([johnWallet]);
        gnosisSafe.setWallet(johnWallet);
        const execTxAction = gnosisSafe.transferEther(toAddress, value);

        const errorListener = async message => {
          onError();
          execTxAction.unsubscribe();
        };

        // Note: Some error events are been trigger only from the confirmationListener
        // See more: https://github.com/tasitlabs/TasitSDK/issues/253
        const confirmationListener = () => {};

        execTxAction.on("error", errorListener);
        execTxAction.on("confirmation", confirmationListener);

        await execTxAction.waitForNonceToUpdate();

        await mineBlocks(provider, 1);

        expect(onError.callCount).to.equal(1);
        const balanceAfter = await provider.getBalance(GNOSIS_SAFE_ADDRESS);
        expect(`${balanceAfter}`).to.equal(`${balanceBefore}`);
      });
    });
  });

  describe("test cases that needs ERC20 deposit to the wallet", async () => {
    beforeEach("faucet", async () => {
      await erc20Faucet(erc20, root, GNOSIS_SAFE_ADDRESS, ONE);
      const balance = await erc20.balanceOf(GNOSIS_SAFE_ADDRESS);
      expect(`${balance}`).to.equal(`${ONE}`);
    });

    it("contract account should send ERC20 tokens back to owner", async () => {
      const tokenAddress = ERC20_ADDRESS;
      const { address: toAddress } = johnWallet;
      const value = ONE;

      gnosisSafe.setSigners([johnWallet]);
      gnosisSafe.setWallet(johnWallet);
      const action = gnosisSafe.transferERC20(tokenAddress, toAddress, value);
      await action.waitForNonceToUpdate();

      const balance = await erc20.balanceOf(GNOSIS_SAFE_ADDRESS);
      expect(`${balance}`).to.equal(`${ZERO}`);
    });

    // TODO: Move to tasit-link-wallet
    describe("spending by an ephemeral account", () => {
      beforeEach("ethers to the ephemeral account pay for gas", async () => {
        const { address: ephemeralAddress } = ephemeralWallet;
        await etherFaucet(provider, root, ephemeralAddress, SMALL_AMOUNT);
        const balance = await provider.getBalance(ephemeralAddress);
        expect(`${balance}`).to.equal(`${SMALL_AMOUNT}`);
      });

      it("ephemeral account shouldn't be able to transfer funds from wallet without allowance", async () => {
        const onError = sinon.fake();
        const balanceBefore = await erc20.balanceOf(GNOSIS_SAFE_ADDRESS);

        const { address: toAddress } = johnWallet;
        const value = ONE;

        gnosisSafe.setWallet(ephemeralWallet);
        const action = erc20.transferFrom(
          GNOSIS_SAFE_ADDRESS,
          toAddress,
          value
        );

        const errorListener = async message => {
          onError();
          action.unsubscribe();
        };

        // Note: Some error events are been trigger only from the confirmationListener
        // See more: https://github.com/tasitlabs/TasitSDK/issues/253
        const confirmationListener = () => {};

        action.on("error", errorListener);
        action.on("confirmation", confirmationListener);

        await action.waitForNonceToUpdate();

        await mineBlocks(provider, 1);

        expect(onError.callCount).to.equal(1);
        const balanceAfter = await erc20.balanceOf(GNOSIS_SAFE_ADDRESS);
        expect(`${balanceAfter}`).to.equal(`${balanceBefore}`);
      });

      describe("", () => {
        beforeEach(
          "wallet owner should approve an ephemeral account to spend funds",
          async () => {
            const tokenAddress = ERC20_ADDRESS;
            const { address: spender } = ephemeralWallet;

            gnosisSafe.setSigners([johnWallet]);
            gnosisSafe.setWallet(johnWallet);
            const action = gnosisSafe.approveERC20(
              tokenAddress,
              spender,
              SMALL_AMOUNT
            );
            await action.waitForNonceToUpdate();

            await mineBlocks(provider, 1);

            const allowed = await erc20.allowance(GNOSIS_SAFE_ADDRESS, spender);

            expect(`${allowed}`).to.equal(`${SMALL_AMOUNT}`);
          }
        );

        it("ephemeral account should transfer allowed funds from wallet", async () => {
          const balanceBefore = await erc20.balanceOf(GNOSIS_SAFE_ADDRESS);

          const { address: toAddress } = johnWallet;

          erc20.setWallet(ephemeralWallet);
          const action = erc20.transferFrom(
            GNOSIS_SAFE_ADDRESS,
            toAddress,
            SMALL_AMOUNT
          );

          await action.waitForNonceToUpdate();

          await mineBlocks(provider, 1);

          const balanceAfter = await erc20.balanceOf(GNOSIS_SAFE_ADDRESS);

          expect(`${balanceAfter}`).to.equal(
            `${balanceBefore.sub(SMALL_AMOUNT)}`
          );
        });
      });
    });
  });

  describe("test cases that needs NFT deposit to the wallet", async () => {
    const tokenId = 1;

    beforeEach("faucet", async () => {
      await erc721Faucet(nft, root, GNOSIS_SAFE_ADDRESS, tokenId);

      const balance = await nft.balanceOf(GNOSIS_SAFE_ADDRESS);
      expect(`${balance}`).to.equal(`1`);
    });

    it("contract account should send NFT tokens back to owner", async () => {
      const tokenAddress = NFT_ADDRESS;
      const { address: toAddress } = johnWallet;

      gnosisSafe.setSigners([johnWallet]);
      gnosisSafe.setWallet(johnWallet);
      const execTxAction = gnosisSafe.transferNFT(
        tokenAddress,
        toAddress,
        tokenId
      );
      await execTxAction.waitForNonceToUpdate();

      const balance = await erc20.balanceOf(GNOSIS_SAFE_ADDRESS);
      expect(`${balance}`).to.equal(`${ZERO}`);
    });
  });
});
