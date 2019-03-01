import Estate from "./Estate";
import TasitContracts from "../../../tasit-contracts/dist";
const { local: localContracts } = TasitContracts;
const { EstateRegistry } = localContracts;
const { address: ESTATE_ADDRESS } = EstateRegistry;

describe("TasitAction.ERC721.Estate", () => {
  // Note: This test runs against an uninitialized contract.
  // TODO: Improve that test case when we move to forked from testnet blockchain.
  it("should get the Estate owner", async () => {
    const estate = new Estate(ESTATE_ADDRESS);
    let owner = await estate.owner();
    expect(owner).to.equal("0x0000000000000000000000000000000000000000");
  });
});
