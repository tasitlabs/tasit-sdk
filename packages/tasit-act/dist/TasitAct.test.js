"use strict";

var _TasitAct = require("./TasitAct");

var _tasitAccount = _interopRequireDefault(require("tasit-account"));

var _chai = require("chai");

var _utils = require("./helpers/utils.js");

var _SimpleStorage = require("./helpers/SimpleStorage.json");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Note: SimpleStorage.json is originally genarated by `tasit-contracts` and was pasted here manually
// See https://github.com/tasitlabs/TasitSDK/issues/45
// Note: Under the current `tasit-contracts` setup SimpleStorage aways will deployed with this address
// See https://github.com/tasitlabs/TasitSDK/pull/59#discussion_r242258739
const contractAddress = "0x6C4A015797DDDd87866451914eCe1e8b19261931";
describe.only("Contract", function () {
  let simpleStorage;
  beforeEach("should connect to an existing contract", async () => {
    simpleStorage = new _TasitAct.Contract(contractAddress, _SimpleStorage.abi);
    (0, _chai.expect)(simpleStorage).to.exist;
    (0, _chai.expect)(simpleStorage.address).to.equal(contractAddress);
    (0, _chai.expect)(simpleStorage.getValue).to.exist;
    (0, _chai.expect)(simpleStorage.setValue).to.exist; // Events are not implemented yet
    //expect(simpleStorage.ValueChanged).to.exist;
  });
  it("should throw error when instantiated with invalid args", async () => {
    try {
      new _TasitAct.Contract();
      (0, _chai.assert)(false, "constructor without address and ABI");
      new _TasitAct.Contract(contractAddress);
      (0, _chai.assert)(false, "constructor without ABI");
      new _TasitAct.Contract("invalid address");
      (0, _chai.assert)(false, "constructor with invalid address");
      new _TasitAct.Contract("invalid address", _SimpleStorage.abi);
      (0, _chai.assert)(false, "constructor with invalid address and valid ABI");
      new _TasitAct.Contract(contractAddress, "invalid abi");
      (0, _chai.assert)(false, "constructor with valid address and invalid ABI");
    } catch (e) {
      (0, _chai.assert)(true);
    }
  });
  it("should call a read-only contract method", async () => {
    const value = await simpleStorage.getValue();
    (0, _chai.expect)(value).to.exist;
  });
  it("should throw error when setting invalid wallet", async () => {
    try {
      simpleStorage = simpleStorage.setWallet();
      (0, _chai.assert)(false, "setting no wallet");
      simpleStorage = simpleStorage.setWallet("invalid wallet");
      (0, _chai.assert)(false, "setting invalid wallet");
    } catch (e) {
      (0, _chai.assert)(true);
    }
  });
  it("should throw error when calling write method without account/wallet/signer", async () => {
    try {
      simpleStorage.setValue("hello world");
      (0, _chai.assert)(false, "calling write function without account");
    } catch (e) {
      (0, _chai.assert)(true);
    }
  });
  it("should call a write contract method (send tx)", async () => {
    // Account creates a wallet, should it create an account object that encapsulate the wallet?
    // TasitAcount.create()
    // > Acount { wallet: ..., metaTxInfos..., etc }
    const wallet = _tasitAccount.default.createFromPrivateKey("0x11d943d7649fbdeb146dc57bd9cfc80b086bfab2330c7b25651dbaf382392f60");

    simpleStorage = simpleStorage.setWallet(wallet);
    var rand = Math.floor(Math.random() * Math.floor(1000)).toString();
    const subscription = simpleStorage.setValue(rand);

    const onMessage = async message => {
      // message.data = Contents of the message.
      const {
        data
      } = message;
      const {
        confirmations
      } = data;

      if (confirmations === 7) {
        subscription.removeAllListeners();
        const value = await simpleStorage.getValue();
        (0, _chai.expect)(value).to.equal(rand); // force UnhandledPromiseRejectionWarning
        //expect(1).to.equal(2);
      }
    };

    subscription.on("confirmation", onMessage);
    await (0, _utils.mineBlocks)(simpleStorage.getProvider(), 8);
  });
  it.skip("should send a signed message", async () => {});
  it.skip("should listen to an event", async () => {});
});