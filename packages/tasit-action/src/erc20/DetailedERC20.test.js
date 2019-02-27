import DetailedERC20 from "./DetailedERC20";

// Note: Under the current `tasit-contracts` setup DetailedERC20 aways will deployed with this address
// See https://github.com/tasitlabs/TasitSDK/issues/138
const DETAILED_ERC20_ADDRESS = "0x37E1A58dD465D33263D00185D065Ee36DD34CDb4";

describe("TasitAction.ERC20.DetailedERC20", () => {
  it("should get the DetailedERC20 name", async () => {
    const erc20 = new DetailedERC20(DETAILED_ERC20_ADDRESS);
    const name = await erc20.name();
    expect(name).to.equal("Detailed ERC20 Token");
  });
});
