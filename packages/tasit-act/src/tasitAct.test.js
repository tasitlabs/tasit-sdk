import Contract from "./tasitAct";
import { expect, assert } from "chai";
// Note: This file is originally genarated by `tasit-contracts` and was pasted here manually
// See https://github.com/tasitlabs/TasitSDK/issues/45
import { abi as contractABI } from "./helpers/SimpleStorage.json";
// Note: Under the current `tasit-contracts` setup SimpleStorage aways will deployed with this address
// See https://github.com/tasitlabs/TasitSDK/pull/59#discussion_r242258739
const contractAddress = "0x6C4A015797DDDd87866451914eCe1e8b19261931";

describe.skip("Contract", function() {
  let simpleStorage;

  beforeEach("should connect to and existing contract", async () => {
    // Connection with blockchain
    // Ethers.js allows sets a "connector" (provider or already connected wallet) on constructor of Contract
    // or later with contract.connect() method.
    // How connection should be made in here?
    // - Make sense always uses `tasit-account` to create connected account instead of interact with provider object?
    // - If Account encapsulates the provider object, Contract will connect with blockchain thru Account.
    // I think that the point here is about how/if we will expose Provider object
    simpleStorage = new Contract(contractAddress, contractABI);
    simpleStorage.connect(account); // or new Contract(addr, abi, account)
    expect(simpleStorage).to.exist;
    expect(simpleStorage.address).to.equal(contractAddress);
  });

  it("should call a read-only contract method", async () => {
    const value = await simpleStorage.getValue();
    expect(value).to.exist;
  });

  it("should call a write contract method (send tx)", async () => {
    var rand = Math.floor(Math.random() * Math.floor(1000));
    const tx = await simpleStorage.setValue(rand);

    // How to wait a tx?
    // Ethers uses:
    // await provider.waitForTransaction(updateValueTx.hash);
    // Some possibilities:
    await simpleStorage.waitForTransaction(tx.hash);
    // or
    // await simpleStorage.getAccount().waitForTransaction(tx.hash);
    // or even (too much chained)
    // await simpleStorage.getAccount().getProvider().waitForTransaction(tx.hash);

    const value = await simpleStorage.getValue();
    expect(value).to.equal(rand);
  });

  it("should send a signed message", async () => {
    // Steps to do that:
    // 1. Encode contract function with param(s);
    // 2. Create rawTx with data above;
    // 3. Sign rawTx
    // 4. Broadcast signedTx

    // Step 1
    // Web3.js 1.0: data = simpleStorage.methods.setValue(rand).encodeABI()
    // Ether.js:
    const data = simpleStorage.interface.functions.setValue.encode([rand]); // How we'll do that?

    // Step 2
    // A basic tx contains these params:
    // gasLimit: I'm almost sure that the gasLimit can be calculated automatically
    // to: simpleStorage.address
    // data: Encoded function call
    // nonce: Can be get easly from wallet.address
    //
    // That said, we can do Step 1 & 2 with one command like that:
    // In the case, command above will be unnecessary
    const rawTx = simpleStorage.interface.functions.setValue(rand).toRawTx();

    // Step 3
    const signedTx = simpleStorage.getAccount().sign(rawTx);
    // or we can do 1..3 steps:
    // const signedTx = simpleStorage.interface.functions.setValue(rand).toSignedTx();

    // Step 4
    const sentTx = simpleStorage.sendTransaction(signedTx); // Same as provider.sendTransaction
  });

  it("should listening to an event", async () => {});
});
