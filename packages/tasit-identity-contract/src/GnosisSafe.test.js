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
  let root;
  let gnosisSafeOwner;
  let ephemeralAccount;
  let someone;
  let gnosisSafe;
  let erc20;
  let nft;

  before("", async () => {
    // That account is funded with ethers and is owner of all token contracts deployed
    [root] = accounts;
    gnosisSafeOwner = accounts[9];
    ephemeralAccount = Account.create();
    someone = Account.create();

    // Contract deployment setup with john (accounts[9]) as the only owner
    // To change that, edit the file "tasit-contract/3rd-parties/gnosis/scripts/2_deploy_contracts.js"
    gnosisSafe = new GnosisSafe(GNOSIS_SAFE_ADDRESS);

    erc20 = new ERC20Full(ERC20_ADDRESS);
    nft = new ERC721Full(NFT_ADDRESS);
  });

  beforeEach("", async () => {
    const { address: someoneAddress } = someone;

    confirmEtherBalances(provider, [GNOSIS_SAFE_ADDRESS], [ZERO]);
    confirmBalances(erc20, [GNOSIS_SAFE_ADDRESS], [ZERO]);
    confirmBalances(nft, [GNOSIS_SAFE_ADDRESS], [ZERO]);

    confirmEtherBalances(provider, [someoneAddress], [ZERO]);
    confirmBalances(erc20, [someoneAddress], [ZERO]);
    confirmBalances(nft, [someoneAddress], [ZERO]);

    gnosisSafe.setSigners([]);
    gnosisSafe.removeWallet();
    erc20.removeWallet();
    nft.removeWallet();
  });

  afterEach("", async () => {
    expect(erc20.subscribedEventNames()).to.be.empty;
    expect(gnosisSafe.subscribedEventNames()).to.be.empty;
    expect(provider._events).to.be.empty;
  });

  describe("test cases that need ETH deposit to the contract-based account", async () => {
    beforeEach("faucet", async () => {
      await etherFaucet(provider, root, GNOSIS_SAFE_ADDRESS, ONE);
      confirmEtherBalances(provider, [GNOSIS_SAFE_ADDRESS], [ONE]);
    });

    it("contract-based account should send ETHs to someone", async () => {
      const { address: toAddress } = someone;

      gnosisSafe.setSigners([gnosisSafeOwner]);
      gnosisSafe.setWallet(gnosisSafeOwner);
      const action = gnosisSafe.transferEther(toAddress, ONE);
      await action.waitForNonceToUpdate();

      confirmEtherBalances(provider, [GNOSIS_SAFE_ADDRESS], [ZERO]);
      confirmEtherBalances(provider, [toAddress], [ONE]);
    });

    describe("test cases with more than one signer", () => {
      beforeEach(
        "contract-based accounts' owner should add an account as signer",
        async () => {
          const { address: ownerAddress } = gnosisSafeOwner;

          const ownersBefore = await gnosisSafe.getOwners();
          expect(ownersBefore).deep.equal([ownerAddress]);

          const thresholdBefore = await gnosisSafe.getThreshold();
          expect(`${thresholdBefore}`).to.equal(`1`);

          const { address: newSignerAddress } = ephemeralAccount;
          const newThreshold = `2`;

          gnosisSafe.setSigners([gnosisSafeOwner]);
          gnosisSafe.setWallet(gnosisSafeOwner);
          const action = gnosisSafe.addSignerWithThreshold(
            newSignerAddress,
            newThreshold
          );
          await action.waitForNonceToUpdate();

          const ownersAfter = await gnosisSafe.getOwners();
          expect(ownersAfter).deep.equal([newSignerAddress, ownerAddress]);

          const thresholdAfter = await gnosisSafe.getThreshold();
          expect(`${thresholdAfter}`).to.equal(newThreshold);
        }
      );

      it("shouldn't be able to execute transfer with insufficient signers", async () => {
        const onError = sinon.fake();
        const balanceBefore = await provider.getBalance(GNOSIS_SAFE_ADDRESS);
        const { address: toAddress } = someone;

        gnosisSafe.setSigners([gnosisSafeOwner]);
        gnosisSafe.setWallet(gnosisSafeOwner);
        const action = gnosisSafe.transferEther(toAddress, ONE);

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
        confirmEtherBalances(provider, [GNOSIS_SAFE_ADDRESS], [balanceBefore]);
      });
    });
  });

  describe("test cases that need ERC20 deposit to the contract-based account", async () => {
    beforeEach("faucet", async () => {
      await erc20Faucet(erc20, root, GNOSIS_SAFE_ADDRESS, ONE);
      confirmBalances(erc20, [GNOSIS_SAFE_ADDRESS], [ONE]);
    });

    it("contract-based account should send ERC20 tokens to someone", async () => {
      const tokenAddress = ERC20_ADDRESS;
      const { address: toAddress } = someone;

      gnosisSafe.setSigners([gnosisSafeOwner]);
      gnosisSafe.setWallet(gnosisSafeOwner);
      const action = gnosisSafe.transferERC20(tokenAddress, toAddress, ONE);
      await action.waitForNonceToUpdate();

      confirmBalances(erc20, [GNOSIS_SAFE_ADDRESS], [ZERO]);
      confirmBalances(erc20, [toAddress], [ONE]);
    });

    describe("spending by an ephemeral account", () => {
      beforeEach("ethers to the ephemeral account pay for gas", async () => {
        const { address: ephemeralAddress } = ephemeralAccount;
        await etherFaucet(provider, root, ephemeralAddress, SMALL_AMOUNT);
        confirmEtherBalances(provider, [ephemeralAddress], [SMALL_AMOUNT]);
      });

      it("ephemeral account shouldn't be able to transfer funds from contract-based account without allowance", async () => {
        const onError = sinon.fake();
        const balanceBefore = await erc20.balanceOf(GNOSIS_SAFE_ADDRESS);

        const { address: toAddress } = someone;

        gnosisSafe.setWallet(ephemeralAccount);
        const action = erc20.transferFrom(GNOSIS_SAFE_ADDRESS, toAddress, ONE);

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
        confirmBalances(erc20, [GNOSIS_SAFE_ADDRESS], [balanceBefore]);
      });

      describe("test cases that need ERC20 spending approval for ephemeral account", () => {
        // TODO: Move to tasit-link-wallet
        beforeEach(
          "contract-based accounts' owner should approve an ephemeral account to spend funds",
          async () => {
            const tokenAddress = ERC20_ADDRESS;
            const { address: spenderAddress } = ephemeralAccount;

            gnosisSafe.setSigners([gnosisSafeOwner]);
            gnosisSafe.setWallet(gnosisSafeOwner);
            const action = gnosisSafe.approveERC20(
              tokenAddress,
              spenderAddress,
              SMALL_AMOUNT
            );
            await action.waitForNonceToUpdate();

            await mineBlocks(provider, 1);

            const amountAllowed = await erc20.allowance(
              GNOSIS_SAFE_ADDRESS,
              spenderAddress
            );

            expect(`${amountAllowed}`).to.equal(`${SMALL_AMOUNT}`);
          }
        );

        it("ephemeral account should transfer allowed funds from the contract-based account", async () => {
          const balanceBefore = await erc20.balanceOf(GNOSIS_SAFE_ADDRESS);
          const { address: toAddress } = someone;

          erc20.setWallet(ephemeralAccount);
          const action = erc20.transferFrom(
            GNOSIS_SAFE_ADDRESS,
            toAddress,
            SMALL_AMOUNT
          );

          await action.waitForNonceToUpdate();

          await mineBlocks(provider, 1);

          const expectedBalance = balanceBefore.sub(SMALL_AMOUNT);
          confirmBalances(erc20, [GNOSIS_SAFE_ADDRESS], [expectedBalance]);
          confirmBalances(erc20, [toAddress], [SMALL_AMOUNT]);
        });
      });
    });
  });

  describe("test cases that need NFT deposit to the contract-based account", async () => {
    const tokenId = 1;

    beforeEach("faucet", async () => {
      await erc721Faucet(nft, root, GNOSIS_SAFE_ADDRESS, tokenId);
      confirmBalances(nft, [GNOSIS_SAFE_ADDRESS], [1]);
    });

    it("contract-based account should send NFT tokens to someone", async () => {
      const tokenAddress = NFT_ADDRESS;
      const { address: toAddress } = someone;

      gnosisSafe.setSigners([gnosisSafeOwner]);
      gnosisSafe.setWallet(gnosisSafeOwner);
      const action = gnosisSafe.transferNFT(tokenAddress, toAddress, tokenId);
      await action.waitForNonceToUpdate();

      confirmBalances(nft, [GNOSIS_SAFE_ADDRESS], [ZERO]);
      confirmBalances(nft, [toAddress], [1]);
    });
  });
});
