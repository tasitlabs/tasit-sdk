import Action from "tasit-action";
const { ERC20, ERC721 } = Action;
const { ERC20Full } = ERC20;
const { ERC721Full } = ERC721;
import GnosisSafe from "./GnosisSafe";
import { local as localAddresses } from "../../tasit-contracts/3rd-parties/gnosis/addresses";

import Account from "../../tasit-account/dist/index";

const { GnosisSafe: GNOSIS_SAFE_ADDRESS } = localAddresses;
const ERC20_ADDRESS = "0x37E1A58dD465D33263D00185D065Ee36DD34CDb4";
const NFT_ADDRESS = "0x0E86f209729bf54763789CDBcA9E8b94f0FD5333";

// 100 gwei
const GAS_PRICE = bigNumberify(`${1e11}`);

const { ZERO, ONE } = constants;

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
      const signers = [johnWallet];
      const { address: toAddress } = johnWallet;
      const value = ONE;

      gnosisSafe.setWallet(johnWallet);
      const execTxAction = await gnosisSafe.transferEther(
        signers,
        toAddress,
        value
      );
      await execTxAction.waitForNonceToUpdate();

      const balance = await provider.getBalance(GNOSIS_SAFE_ADDRESS);
      expect(`${balance}`).to.equal(`${ZERO}`);
    });
  });

  describe("test cases that needs ERC20 deposit to the wallet", async () => {
    beforeEach("faucet", async () => {
      await erc20Faucet(erc20, root, GNOSIS_SAFE_ADDRESS, ONE);
      const balance = await erc20.balanceOf(GNOSIS_SAFE_ADDRESS);
      expect(`${balance}`).to.equal(`${ONE}`);
    });

    it("contract account should send ERC20 tokens back to owner", async () => {
      const signers = [johnWallet];
      const tokenAddress = ERC20_ADDRESS;
      const { address: toAddress } = johnWallet;
      const value = ONE;

      gnosisSafe.setWallet(johnWallet);
      const action = await gnosisSafe.transferERC20(
        signers,
        tokenAddress,
        toAddress,
        value
      );
      await action.waitForNonceToUpdate();

      const balance = await erc20.balanceOf(GNOSIS_SAFE_ADDRESS);
      expect(`${balance}`).to.equal(`${ZERO}`);
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
      const signers = [johnWallet];
      const tokenAddress = NFT_ADDRESS;
      const { address: toAddress } = johnWallet;

      gnosisSafe.setWallet(johnWallet);
      const execTxAction = await gnosisSafe.transferNFT(
        signers,
        tokenAddress,
        toAddress,
        tokenId
      );
      await execTxAction.waitForNonceToUpdate();

      const balance = await erc20.balanceOf(GNOSIS_SAFE_ADDRESS);
      expect(`${balance}`).to.equal(`${ZERO}`);
    });
  });

  it("wallet owner should add an account as signer", async () => {
    const { address: johnAddress } = johnWallet;

    const ownersBefore = await gnosisSafe.getOwners();
    expect(ownersBefore).deep.equal([johnAddress]);

    const thresholdBefore = await gnosisSafe.getThreshold();
    expect(`${thresholdBefore}`).to.equal(`1`);

    const signers = [johnWallet];
    const { address: newSignerAddress } = ephemeralWallet;
    const newThreshold = `2`;

    gnosisSafe.setWallet(johnWallet);
    const action = await gnosisSafe.addSignerWithThreshold(
      signers,
      newSignerAddress,
      newThreshold
    );
    await action.waitForNonceToUpdate();

    const ownersAfter = await gnosisSafe.getOwners();
    expect(ownersAfter).deep.equal([newSignerAddress, johnAddress]);

    const thresholdAdter = await gnosisSafe.getThreshold();
    expect(`${thresholdAdter}`).to.equal(`2`);
  });

  // TODO:
  // - Setup DailyLimitModule to the Gnosis Safe Contract
  // - Move to tasit-link-wallet
  it.skip("wallet owner should approve an ephemeral account to spend funds", async () => {});
});
