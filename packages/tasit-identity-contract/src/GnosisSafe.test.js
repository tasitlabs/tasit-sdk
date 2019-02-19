import Action from "tasit-action";
const { ConfigLoader } = Action;
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

const { utils: ethersUtils } = ethers;
const { bigNumberify } = ethersUtils;

const ZERO = 0;
const ONE_ETHER = bigNumberify(`${1e18}`);

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
  let gnosisSafeContract;
  let gnosisSafeUtils;
  let anaWallet;
  let snapshotId;
  let provider;

  before("", async () => {
    ConfigLoader.setConfig(config);

    provider = ProviderFactory.getProvider();

    const anaPrivateKey =
      "0x11d943d7649fbdeb146dc57bd9cfc80b086bfab2330c7b25651dbaf382392f60";

    anaWallet = createFromPrivateKey(anaPrivateKey);

    // Contract deployment setup with ana (accounts[0]) as the only owner
    // To change that, edit the file "tasit-contract/3rd-parties/gnosis/scripts/2_deploy_contracts.js"
    gnosisSafeContract = new GnosisSafe(GNOSIS_SAFE_ADDRESS);
  });

  beforeEach("", async () => {
    snapshotId = await createSnapshot(provider);
  });

  afterEach("", async () => {
    await revertFromSnapshot(provider, snapshotId);
  });

  it("wallet owner should deposit and withdraw 1 ETH", async function() {
    const balanceBeforeDeposit = await provider.getBalance(GNOSIS_SAFE_ADDRESS);
    expect(`${balanceBeforeDeposit}`).to.equal(`${ZERO}`);

    anaWallet = anaWallet.connect(provider);
    await anaWallet.sendTransaction({
      to: GNOSIS_SAFE_ADDRESS,
      value: ONE_ETHER,
    });

    const balanceAfterDeposit = await provider.getBalance(GNOSIS_SAFE_ADDRESS);
    expect(`${balanceAfterDeposit}`).to.equal(`${ONE_ETHER}`);

    const signers = [anaWallet];
    const senderWallet = anaWallet;
    const toAddress = anaWallet.address;
    const value = ONE_ETHER;
    const execTxAction = await gnosisSafeContract.sendEtherTransaction(
      signers,
      senderWallet,
      toAddress,
      value
    );
    await execTxAction.waitForNonceToUpdate();

    const balanceAfterWithdraw = await provider.getBalance(GNOSIS_SAFE_ADDRESS);
    expect(`${balanceAfterWithdraw}`).to.equal(`${ZERO}`);
  });
});
