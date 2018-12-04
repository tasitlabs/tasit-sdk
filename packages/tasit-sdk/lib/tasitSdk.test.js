"use strict";

var _tasitSdk = require("./tasitSdk");

var _chai = require("chai");

describe.only("Account", function () {
  it("should create a random wallet", async function () {
    let w = _tasitSdk.Account.create();

    (0, _chai.expect)(w.address).to.have.lengthOf(42);
  });
});