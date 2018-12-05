import { Account } from "./tasitSdk";
import { expect, assert } from "chai";

describe("Account", function() {
  it("should create a random wallet", async function() {
    let w = Account.create();
    expect(w.address).to.have.lengthOf(42);
  });
});
