import Land from "./Land";
import TasitContracts from "tasit-contracts";
const { local: localContracts } = TasitContracts;
const { LANDProxy } = localContracts;
const { address: LAND_PROXY_ADDRESS } = LANDProxy;

describe("TasitAction.ERC721.Land", () => {
  it("should get the Land owner", async () => {
    const land = new Land(LAND_PROXY_ADDRESS);
    let owner = await land.owner();
    expect(owner).to.equal("0xd68649157A061454e2c63c175236b07e98Bd9512");
  });
});
