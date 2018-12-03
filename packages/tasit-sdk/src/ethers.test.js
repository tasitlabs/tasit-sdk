import { expect, assert } from "chai";
import { ethers } from "ethers";

const ropstenProvider = ethers.getDefaultProvider("ropsten");
const privateKey =
  "0x18bfdd05c1e63e4a27081352e2910c164a4d34588f8d7eecfdfcb654742934c2";
const ensSample = {
  provider: ethers.getDefaultProvider(),
  name: "registrar.firefly.eth",
  address: "0x6fC21092DA55B392b045eD78F4732bff3C580e2c"
};
const contractABI = [
  "event ValueChanged(address indexed author, string oldValue, string newValue)",
  "constructor(string value)",
  "function getValue() view returns (string value)",
  "function setValue(string value)"
];
const contractAddress = "0x2bD9aAa2953F988153c8629926D22A6a5F69b14E";

var wallet, randomWallet, contract;
var rawTx = {
  nonce: 0,
  gasLimit: 21000,
  gasPrice: ethers.utils.bigNumberify("20000000000"),
  to: "0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290",
  value: ethers.utils.parseEther("0.0000001"),
  data: "0x",
  chainId: ethers.utils.getNetwork("ropsten").chainId
};

var waitForEvent = async (eventName, expected) => {
  return new Promise(function(resolve, reject) {
    contract.on(eventName, function() {
      var args = Array.prototype.slice.call(arguments);
      var event = args.pop();
      event.removeListener();
      expect(args).to.deep.equal(expected);
      resolve();
    });
  });
};

describe("ethers.js", function() {
  before(
    "should create a funded wallet from priv key and provider",
    async () => {
      wallet = new ethers.Wallet(privateKey, ropstenProvider);

      expect(wallet.address).to.have.lengthOf(42);
      expect(wallet.provider).to.be.not.undefined;

      let balance = ethers.utils.bigNumberify(await wallet.getBalance());
      let zero = ethers.utils.bigNumberify(0);

      assert(balance.gt(zero), "wallet balance is zero");
    }
  );

  // it("should create a wallet from priv key and provider", async function() {
  //   wallet = new ethers.Wallet(privateKey, ropstenProvider);
  //   expect(wallet.address).to.have.lengthOf(42);
  //   expect(wallet.provider).to.be.not.undefined;
  // });
  //
  // it("wallet should has funds", async function() {
  //   let balance = ethers.utils.bigNumberify(await wallet.getBalance());
  //   let zero = ethers.utils.bigNumberify(0);
  //
  //   assert(balance.gt(zero));
  // });

  it("should create a random wallet", async function() {
    randomWallet = ethers.Wallet.createRandom();
    expect(randomWallet.address).to.have.lengthOf(42);
  });
// Note: We're intentionally not testing the `fromEncryptedJson` or `encrypt` functions
// from `ethers.js` because we don't plan to expose that functionality in the Tasit SDK.
// For a detailed explanation of why, see this GitHub issue:
// https://github.com/tasitlabs/TasitSDK/issues/24#issuecomment-443576993```
  it("should sign a raw transaction", async function() {
    let signedTx = await wallet.sign(rawTx);

    const expectedSignedTx =
      "0xf869808504a817c8008252089488a5c2d9919e46f883eb62f7b8dd9d0cc45bc29085" +
      "174876e8008029a00ea09864b0757df77c4fddd91ab4cb585a1c56dd433de363ca98cd" +
      "1eebe0a9aca05804e85eebc1de8d0c1de189ce2dafe94ed197565723a3b335c90d3f73" +
      "62eb7b";

    expect(signedTx).to.be.equals(expectedSignedTx);
  });

  it("should broadcast signed tx", async function() {
    rawTx.nonce = await ropstenProvider.getTransactionCount(wallet.address);
    let signedTx = await wallet.sign(rawTx);
    let sentTx = await ropstenProvider.sendTransaction(signedTx);
    expect(sentTx).to.be.not.undefined;

    await ropstenProvider.waitForTransaction(sentTx.hash);
    let txResponse = await ropstenProvider.getTransaction(sentTx.hash);
    expect(txResponse.blockHash).to.be.not.undefined;
  });

  it("should sign a message", async function() {
    const rawMsg = "Hello World!";
    let signedMsg = await wallet.signMessage(rawMsg);

    const expectedSignedMsg =
      "0xcdd313d56ac1945e799a8c9d28d971fe40231ab354178611fbfe9b5ec00f493a4e33" +
      "2781e2e72c1978b0d5540ff9fb667c54dc5c0792d9cf9b0ec10485da0d021b";

    expect(signedMsg).to.be.equals(expectedSignedMsg);
  });

  it("should sign a binary message", async function() {
    // The 66 character hex string MUST be converted to a 32-byte array first!
    const hash =
      "0x3ea2f1d0abf3fc66cf29eebb70cbd4e7fe762ef8a09bcc06c8edf641230afec0";

    let binData = ethers.utils.arrayify(hash);

    const expectedSignedBinData =
      "0x4d6e6ed24078bbdb3e2d45a01276666c64f396915050271cc40e5874448b5e876ea6" +
      "44cb1887e70cc6acd0cf6bfc13146261748c5450d8e21f8980ac7defda811b";

    let signedBinData = await wallet.signMessage(binData);

    expect(signedBinData).to.be.equals(expectedSignedBinData);
  });

  it("should resolve ENS name", async function() {
    let address = await ensSample.provider.resolveName(ensSample.name);
    expect(address).to.equal(ensSample.address);
  });

  it("should lookup ENS address", async function() {
    let name = await ensSample.provider.lookupAddress(ensSample.address);
    expect(name).to.equal(ensSample.name);
  });

  it("should instantiate a contract object", async function() {
    contract = new ethers.Contract(contractAddress, contractABI, wallet);
    expect(contract.address).to.be.equals(contractAddress);
  });

  it("should get/set contract's value", async function() {
    let currentValue = await contract.getValue();
    let message = `I like dogs ${randomWallet.mnemonic}`;
    expect(currentValue).to.be.not.equals(message);

    let updateValueTx = await contract.setValue(message);
    await ropstenProvider.waitForTransaction(updateValueTx.hash);

    let newValue = await contract.getValue();

    expect(newValue).to.equal(message);
  });

  it("should watch contract's ValueChanged event", async function() {
    let oldValue = await contract.getValue();
    let newValue = `I like cats ${randomWallet.mnemonic}`;

    let tx = await contract.setValue(newValue);

    await waitForEvent("ValueChanged", [wallet.address, oldValue, newValue]);
    await ropstenProvider.waitForTransaction(tx.hash);
  });
});
