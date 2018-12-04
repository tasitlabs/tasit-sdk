"use strict";

var _tasitAccount = _interopRequireDefault(require("./tasitAccount"));

var _chai = require("chai");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe("Account", function () {
  it("should create a random wallet", async function () {
    let w = _tasitAccount.default.create();

    (0, _chai.expect)(w.address).to.have.lengthOf(42);
  });
});