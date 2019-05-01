import ERC20Full from "./ERC20Full";
import TasitContracts from "tasit-contracts";
const { local: localContracts } = TasitContracts;
const { MyERC20Full } = localContracts;
const { address: ERC20_FULL_ADDRESS } = MyERC20Full;

describe("TasitAction.ERC20.ERC20Full", () => {
  it("should get the ERC20Full name", async () => {
    const erc20 = new ERC20Full(ERC20_FULL_ADDRESS);
    const name = await erc20.name();
    expect(name).to.equal("ERC20Full");
  });
});
