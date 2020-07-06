import Account from "./TasitAccount";

describe("Account", () => {
  it("should create a random account", async () => {
    const w = Account.create();
    expect(w.address).toHaveLength(42);
  });
});
