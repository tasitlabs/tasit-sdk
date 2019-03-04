import ERC20Full from "./ERC20Full";

// Note: Under the current `tasit-contracts` setup MyERC20Full always will be deployed with this address
// See https://github.com/tasitlabs/TasitSDK/issues/138
const ERC20_FULL_ADDRESS = "0x37E1A58dD465D33263D00185D065Ee36DD34CDb4";

describe("TasitAction.ERC20.ERC20Full", () => {
  it("should get the ERC20Full name", async () => {
    const erc20 = new ERC20Full(ERC20_FULL_ADDRESS);
    const name = await erc20.name();
    expect(name).to.equal("ERC20Full");
  });
});
