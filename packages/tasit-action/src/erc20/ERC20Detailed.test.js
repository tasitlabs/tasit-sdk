import ERC20Detailed from "./ERC20Detailed";

// Note: Under the current `tasit-contracts` setup ERC20Detailed aways will deployed with this address
// See https://github.com/tasitlabs/TasitSDK/issues/138
const ERC20_DETAILED_ADDRESS = "0x37E1A58dD465D33263D00185D065Ee36DD34CDb4";

describe("TasitAction.ERC20.ERC20Detailed", () => {
  it("should get the ERC20Detailed name", async () => {
    const erc20 = new ERC20Detailed(ERC20_DETAILED_ADDRESS);
    const name = await erc20.name();
    expect(name).to.equal("ERC20Detailed Token");
  });
});
