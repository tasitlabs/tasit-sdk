import { ethers } from "ethers";

import actionHelpers from "../../tasit-action/dist/testHelpers/helpers";
const { constants, accounts } = actionHelpers;

const { ZERO } = constants;

const provider = new ethers.providers.JsonRpcProvider();
provider.pollingInterval = 50;
global.provider = provider;

// Note: We're intentionally not testing the `fromEncryptedJson` or `encrypt` functions
// from `ethers.js` because we don't plan to expose that functionality in the Tasit SDK.
// For a detailed explanation of why, see this GitHub issue:
// https://github.com/tasitlabs/TasitSDK/issues/24#issuecomment-443576993
describe("ethers.js", () => {
  let wallet;

  beforeEach("instantiate wallet and provider objects", async () => {
    [wallet] = accounts;
    wallet = wallet.connect(provider);

    expect(wallet.address).to.have.lengthOf(42);
    expect(wallet.provider).to.be.not.undefined;
  });

  it("should create a random wallet ", async () => {
    const randomWallet = ethers.Wallet.createRandom();
    expect(randomWallet.address).to.have.lengthOf(42);
  });

  it("should get balance of wallet", async () => {
    let randomWallet = ethers.Wallet.createRandom();
    randomWallet = randomWallet.connect(provider);

    const fundedWalletBalance = ethers.utils.bigNumberify(
      await wallet.getBalance()
    );
    const emptyWalletBalance = ethers.utils.bigNumberify(
      await randomWallet.getBalance()
    );

    expect(fundedWalletBalance).not.to.be.undefined;
    expect(`${emptyWalletBalance}`).to.equal(`${ZERO}`);
  });

  it("should sign a message", async () => {
    const rawMsg = "Hello World!";
    const signedMsg = await wallet.signMessage(rawMsg);

    const expectedSignedMsg = `0x1d43db04021e3ff7e122e5298b3fc18f1c1d36da7874c44f1eb8d372a037ebd21a5ceac64a29723e13893ec502ae5a1b5f15239b585bdad5801852c712e101671b`;

    expect(signedMsg).to.be.equals(expectedSignedMsg);
  });

  it("should sign a binary message", async () => {
    // The 66 character hex string MUST be converted to a 32-byte array first!
    const hash =
      "0x3ea2f1d0abf3fc66cf29eebb70cbd4e7fe762ef8a09bcc06c8edf641230afec0";

    const binData = ethers.utils.arrayify(hash);

    const expectedSignedBinData = `0xcc803c1bfd6805ccbe8ce6c9c3770e6d023210c308d69284c4ea7b0e54cdb82f41238cbc6f027b40dfca5897b7626734f17ca50cdc797782e92840ca930647261b`;

    const signedBinData = await wallet.signMessage(binData);

    expect(signedBinData).to.equal(expectedSignedBinData);
  });

  const rawTx = {
    nonce: 0,
    gasLimit: 21000,
    gasPrice: ethers.utils.bigNumberify("20000000000"),
    to: "0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290",
    value: ethers.utils.parseEther("0.0000001"),
    data: "0x",
  };

  it("should sign a raw transaction", async () => {
    const signedTx = await wallet.sign(rawTx);

    const expectedSignedTx = `0xf869808504a817c8008252089488a5c2d9919e46f883eb62f7b8dd9d0cc45bc29085174876e800801ba0ea1e53eb8f5510a729eea0612b9b7d9ef36a0a360305db5c5496200f3e07e8f7a0680c0ef7b4cdf854ded2bda1a205725afc3e9a240fe21466ec86426a461e0532`;

    expect(signedTx).to.equal(expectedSignedTx);
  });

  it("should broadcast signed tx", async () => {
    rawTx.nonce = await provider.getTransactionCount(wallet.address);
    const signedTx = await wallet.sign(rawTx);
    const sentTx = await provider.sendTransaction(signedTx);
    expect(sentTx).not.to.be.undefined;

    await provider.waitForTransaction(sentTx.hash);
    const txResponse = await provider.getTransaction(sentTx.hash);
    expect(txResponse.blockHash).to.be.not.undefined;
  });
});
