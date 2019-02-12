import Land from "./Land";

import { local as localAddresses } from "../../../tasit-contracts/decentraland/addresses";
const { LANDProxy: LAND_PROXY_ADDRESS } = localAddresses;

describe("TasitAction.ERC721.Land", () => {
  it("should get the Land owner", async function() {
    const land = new Land(LAND_PROXY_ADDRESS);
    let owner = await land.owner();
    expect(owner).to.equal("0xd68649157A061454e2c63c175236b07e98Bd9512");
  });
});
