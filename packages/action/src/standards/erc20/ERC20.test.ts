// import ERC20 from "./ERC20";
// import TasitContracts from "@tasit/contracts";

// const { local: localContracts } = TasitContracts;
// const { MyERC20 } = localContracts;
// const { address: ERC20_ADDRESS } = MyERC20;

// const { type: Erc20 } = MyERC20;
// TODO: Use this Erc20 type properly

describe.skip("TasitAction.ERC20.ERC20", () => {
  // TODO: Re-enable this test once we get the ERC20 contract
  // typing working
  it.skip("should get the ERC20 name", async () => {
    // const erc20 = new ERC20(ERC20_ADDRESS);
    // const name = await erc20.name();
    expect(name).toEqual("ERC20");
  });

  it("should add 1 + 1", async () => {
    const result = 1 + 1;
    expect(result).toEqual(2);
  });
});
