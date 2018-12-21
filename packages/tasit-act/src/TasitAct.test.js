import { Contract } from "./TasitAct";
import Account from "tasit-account";
import { expect, assert } from "chai";
//acount2: 0xc181b6b02c9757f13f5aa15d1342a58970a8a489722dc0608a1d09fea717c181

// Note: SimpleStorage.json is originally genarated by `tasit-contracts` and was pasted here manually
// See https://github.com/tasitlabs/TasitSDK/issues/45
import { abi as contractABI } from "./helpers/SimpleStorage.json";

// Note: Under the current `tasit-contracts` setup SimpleStorage aways will deployed with this address
// See https://github.com/tasitlabs/TasitSDK/pull/59#discussion_r242258739
const contractAddress = "0x6C4A015797DDDd87866451914eCe1e8b19261931";

describe("Contract", function() {
  let simpleStorage;

  beforeEach("should connect to an existing contract", async () => {
    simpleStorage = new Contract(contractAddress, contractABI);
    expect(simpleStorage).to.exist;
    expect(simpleStorage.address).to.equal(contractAddress);
    expect(simpleStorage.getValue).to.exist;
    expect(simpleStorage.setValue).to.exist;
    // Eventes not implemented yet
    //expect(simpleStorage.ValueChanged).to.exist;
  });

  it("should call a read-only contract method", async () => {
    const value = await simpleStorage.getValue();
    expect(value).to.exist;
  });

  // skipped because listener is stucking test
  // solution: mine blocks manually OR setup -b ganache option
  it.skip("should call a write contract method (send tx)", async () => {
    var rand = Math.floor(Math.random() * Math.floor(1000)).toString();

    // Account creates a wallet, should it create an account object that encapsulate the wallet?
    // TasitAcount.create()
    // > Acount { wallet: ..., metaTxInfos..., etc }
    const wallet = Account.createFromPrivateKey(
      "0x11d943d7649fbdeb146dc57bd9cfc80b086bfab2330c7b25651dbaf382392f60"
    );

    // Note: For now, `tasit-account` creates a wallet object
    simpleStorage = simpleStorage.setWallet(wallet);

    const subscription = simpleStorage.setValue(rand);

    const onMessage = async message => {
      // message.data = Contents of the message.
      const { data } = message;
      const { confirmations } = data;

      //if (confirmations === 7) {
      if (confirmations === 1) {
        subscription.removeAllListeners();
        const value = await simpleStorage.getValue();
        expect(value).to.equal(rand);
      }
    };

    subscription.on("confirmation", onMessage);
  });

  it.skip("should send a signed message", async () => {
    // Step 3
    const signedTx = simpleStorage.getAccount().sign(rawTx);
    // or we can do 1..3 steps:
    // const signedTx = simpleStorage.interface.functions.setValue(rand).toSignedTx();

    // Step 4
    const sentTx = simpleStorage.sendTransaction(signedTx); // Same as provider.sendTransaction
  });

  it.skip("should listen to an event", async () => {});
});
