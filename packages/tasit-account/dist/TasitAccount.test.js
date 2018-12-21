"use strict";

var _TasitAccount = _interopRequireDefault(require("./TasitAccount"));

var _chai = require("chai");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe("Account", function () {
  it("should create a random wallet", async function () {
    let w = _TasitAccount.default.create();

    (0, _chai.expect)(w.address).to.have.lengthOf(42);
  });
  it("should create a wallet from privateKey", async function () {
    let w = _TasitAccount.default.createFromPrivateKey("0x11d943d7649fbdeb146dc57bd9cfc80b086bfab2330c7b25651dbaf382392f60");

    (0, _chai.expect)(w.address).to.have.lengthOf(42);
  });
});