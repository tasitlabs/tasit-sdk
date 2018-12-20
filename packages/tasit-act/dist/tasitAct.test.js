"use strict";

var _tasitAct = _interopRequireDefault(require("./tasitAct"));

var _chai = require("chai");

var _SimpleStorage = require("./helpers/SimpleStorage.json");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Note: This file is originally genarated by `tasit-contracts` and was pasted here manually
// See https://github.com/tasitlabs/TasitSDK/issues/45
// Note: Under the current `tasit-contracts` setup SimpleStorage aways will deployed with this address
// See https://github.com/tasitlabs/TasitSDK/pull/59#discussion_r242258739
const contractAddress = "0x6C4A015797DDDd87866451914eCe1e8b19261931";
describe("Contract", function () {
  let contract;
  beforeEach("should connect to and existing contract", async function () {// contract = new Contract(contractAddress, contractABI);
    // expect(contract).to.exist;
    // expect(contract.address).to.equal(address);
  });
  it("should call a read-only contract method", async function () {});
  it("should call a write contract method (send tx)", async function () {});
  it("should send a signed message", async function () {});
  it("should listening to an event", async function () {});
});