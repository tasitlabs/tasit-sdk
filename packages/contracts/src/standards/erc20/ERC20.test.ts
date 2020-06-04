import ERC20 from "./ERC20";
import TasitContracts from "@tasit/contracts";
const { local: localContracts } = TasitContracts;
const { MyERC20 } = localContracts;
const { address: ERC20_ADDRESS } = MyERC20;

describe("TasitAction.ERC20.ERC20", () => {
  it("should get the ERC20 name", async () => {
    const erc20 = new ERC20(ERC20_ADDRESS);
    const name = await erc20.name();
    expect(name).to.equal("ERC20");
  });
});
