import Account from "./TasitAccount";

describe("Account", function() {
  it("should create a random wallet", async function() {
    let w = Account.create();
    expect(w.address).to.have.lengthOf(42);
  });
});
