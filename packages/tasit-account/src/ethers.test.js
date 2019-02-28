import { ethers } from "ethers";

const { ZERO } = constants;

let wallet;

// Note: We're intentionally not testing the `fromEncryptedJson` or `encrypt` functions
// from `ethers.js` because we don't plan to expose that functionality in the Tasit SDK.
// For a detailed explanation of why, see this GitHub issue:
// https://github.com/tasitlabs/TasitSDK/issues/24#issuecomment-443576993
describe("ethers.js", () => {
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

    const expectedSignedMsg =
      "0x372577a100b677f28381347d58369557563ffddfbc523c0e4a2348ed489427d25bd7" +
      "595ce0f5a0da811bd7cc558e9e6eeed09988cd06fe0c0c9e7df69d373fec1b";

    expect(signedMsg).to.be.equals(expectedSignedMsg);
  });

  it("should sign a binary message", async () => {
    // The 66 character hex string MUST be converted to a 32-byte array first!
    const hash =
      "0x3ea2f1d0abf3fc66cf29eebb70cbd4e7fe762ef8a09bcc06c8edf641230afec0";

    const binData = ethers.utils.arrayify(hash);

    const expectedSignedBinData =
      "0x9c9eab15e04614df2748f3515261b2c15c0cf0e2208d9f3a7610955d511a97c064d8" +
      "7ed31e727052e695859aaa4b00b208a0d088fb17897dda42ac59aad0e1de1c";

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

    const expectedSignedTx =
      "0xf869808504a817c8008252089488a5c2d9919e46f883eb62f7b8dd9d0cc45bc29085" +
      "174876e800801ca0855408709023b3d4e827c7aeb7b1adc4a5480e37601a20d881d10e" +
      "4fd39207aca0179492402dd7a8fdc6190ecdae6ce28f1b6900297b08ed1a18252142d9" +
      "d8c95a";

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
