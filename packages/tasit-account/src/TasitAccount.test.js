import Account from "./TasitAccount";
import { expect, assert } from "chai";

describe("Account", function() {
  it("should create a random wallet", async function() {
    let w = Account.create();
    expect(w.address).to.have.lengthOf(42);
  });

  it("should create a wallet from privateKey", async function() {
    let w = Account.createFromPrivateKey(
      "0x11d943d7649fbdeb146dc57bd9cfc80b086bfab2330c7b25651dbaf382392f60"
    );
    expect(w.address).to.have.lengthOf(42);
  });
});
