import Action from "tasit-action";
const { ConfigLoader, ERC20 } = Action;
const { DetailedERC20 } = ERC20;
import { ethers } from "ethers";
import { expect } from "chai";
import GnosisSafe from "./GnosisSafe";
import { local as localAddresses } from "../../tasit-contracts/3rd-parties/gnosis/addresses";
import { createFromPrivateKey } from "../../tasit-account/dist/testHelpers/helpers";
import {
  mineBlocks,
  createSnapshot,
  revertFromSnapshot,
  confirmBalances,
} from "tasit-action/dist/testHelpers/helpers";

// The goal of this integration test suite is to use only exposed classes
// from TasitSdk. ProviderFactory is used here as an exception
// as the clearest way to get a provider
// in this test suite. Eventually, maybe ProviderFactory may move to
// some shared helper dir.
import ProviderFactory from "tasit-action/dist/ProviderFactory";

const { GnosisSafe: GNOSIS_SAFE_ADDRESS } = localAddresses;
const ERC20_ADDRESS = "0x37E1A58dD465D33263D00185D065Ee36DD34CDb4";

const { utils: ethersUtils } = ethers;
const { bigNumberify } = ethersUtils;

const ZERO = 0;
const ONE = bigNumberify(`${1e18}`);

// 100 gwei
const GAS_PRICE = bigNumberify(`${1e11}`);

describe("GnosisSafe", () => {
  const config = {
    provider: {
      network: "other",
      provider: "jsonrpc",
      pollingInterval: 50,
      jsonRpc: {
        url: "http://localhost",
        port: 8545,
      },
    },
    events: {
      timeout: 2000,
    },
  };
  let gnosisSafe;
  let anaWallet;
  let snapshotId;
  let provider;
  let erc20;

  before("", async () => {
    ConfigLoader.setConfig(config);

    provider = ProviderFactory.getProvider();

    const anaPrivateKey =
      "0x11d943d7649fbdeb146dc57bd9cfc80b086bfab2330c7b25651dbaf382392f60";

    anaWallet = createFromPrivateKey(anaPrivateKey);

    // Contract deployment setup with ana (accounts[0]) as the only owner
    // To change that, edit the file "tasit-contract/3rd-parties/gnosis/scripts/2_deploy_contracts.js"
    gnosisSafe = new GnosisSafe(GNOSIS_SAFE_ADDRESS);

    erc20 = new DetailedERC20(ERC20_ADDRESS);
  });

  beforeEach("", async () => {
    snapshotId = await createSnapshot(provider);

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

    await revertFromSnapshot(provider, snapshotId);
  });

  describe("test cases that needs ETH deposit to the wallet", async () => {
    beforeEach("", async () => {
      anaWallet = anaWallet.connect(provider);
      const tx = await anaWallet.sendTransaction({
        to: GNOSIS_SAFE_ADDRESS,
        value: ONE,
      });
      await provider.waitForTransaction(tx.hash);

      const balanceAfterDeposit = await provider.getBalance(
        GNOSIS_SAFE_ADDRESS
      );
      expect(`${balanceAfterDeposit}`).to.equal(`${ONE}`);
    });

    it("wallet owner should withdraw some ethers", async () => {
      const signers = [anaWallet];
      const { address: toAddress } = anaWallet;
      const value = ONE;

      gnosisSafe.setWallet(anaWallet);
      const execTxAction = await gnosisSafe.transferEther(
        signers,
        toAddress,
        value
      );
      await execTxAction.waitForNonceToUpdate();

      const balanceAfterWithdraw = await provider.getBalance(
        GNOSIS_SAFE_ADDRESS
      );
      expect(`${balanceAfterWithdraw}`).to.equal(`${ZERO}`);
    });

    it("wallet owner should withdraw some ethers", async () => {
      const signers = [anaWallet];
      const { address: toAddress } = anaWallet;
      const value = ONE;

      gnosisSafe.setWallet(anaWallet);
      const action = await gnosisSafe.transferEther(signers, toAddress, value);

      const onConfirmation = async message => {
        const { data } = message;
        const { args } = data;

        action.unsubscribe();

        const balance = await provider.getBalance(GNOSIS_SAFE_ADDRESS);
        expect(`${balance}`).to.equal(`${ZERO}`);
      };

      const onError = message => {
        const { error } = message;
        console.log(error);
      };

      await dispatch(action, onConfirmation, onError);
    });

    const dispatch = async (action, onConfirmation, onError) => {
      return new Promise((resolve, reject) => {
        action.on("confirmation", async message => {
          try {
            await onConfirmation(message);
            resolve();
          } catch (error) {
            reject(error);
          }
        });

        action.on("error", message => {
          const { error } = message;
          onError(message);
          reject(error);
        });
      });
    };
  });

  describe("test cases that needs ERC20 deposit to the wallet", async () => {
    beforeEach("", async () => {
      erc20.setWallet(anaWallet);
      const mintAction = erc20.mint(anaWallet.address, ONE);
      await mintAction.waitForNonceToUpdate();

      const transferAction = erc20.transfer(GNOSIS_SAFE_ADDRESS, ONE);
      await transferAction.waitForNonceToUpdate();

      const balanceAfterDeposit = await erc20.balanceOf(GNOSIS_SAFE_ADDRESS);
      expect(`${balanceAfterDeposit}`).to.equal(`${ONE}`);
    });

    it("wallet owner should withdraw some ERC20 tokens", async () => {
      const signers = [anaWallet];
      const tokenAddress = erc20.getAddress();
      const toAddress = anaWallet.address;
      const value = ONE;

      gnosisSafe.setWallet(anaWallet);
      const execTxAction = await gnosisSafe.transferERC20(
        signers,
        tokenAddress,
        toAddress,
        value
      );
      await execTxAction.waitForNonceToUpdate();

      const balanceAfterWithdraw = await erc20.balanceOf(GNOSIS_SAFE_ADDRESS);
      expect(`${balanceAfterWithdraw}`).to.equal(`${ZERO}`);
    });
  });

  it.skip("wallet owner should deposit and withdraw some ERC721 tokens", async () => {});

  it.skip("wallet owner should add an account as signer", async () => {});

  it.skip("wallet owner should approve an account to spend funds", async () => {});
});
