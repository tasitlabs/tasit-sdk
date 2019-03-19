import Land from "./Land";
import TasitContracts from "tasit-contracts";
const { local: localContracts } = TasitContracts;
const { LANDProxy } = localContracts;
const { address: LAND_PROXY_ADDRESS } = LANDProxy;

describe("TasitAction.ERC721.Land", () => {
  const [contractOwnerWallet] = accounts;
  it("should get the Land owner", async () => {
    const land = new Land(LAND_PROXY_ADDRESS);
    const owner = await land.owner();
    const { address: expectedOwner } = contractOwnerWallet;
    expect(owner).to.equal(expectedOwner);
  });
});
