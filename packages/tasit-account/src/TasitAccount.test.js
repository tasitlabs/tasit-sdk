import Account from "./TasitAccount";

describe("Account", function() {
  it("should create a random account", async () => {
    let w = Account.create();
    expect(w.address).to.have.lengthOf(42);
  });
});
