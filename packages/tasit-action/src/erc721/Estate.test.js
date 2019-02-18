import Estate from "./Estate";

import { local as localAddresses } from "../../../tasit-contracts/3rd-parties/decentraland/addresses";
const { EstateRegistry: ESTATE_ADDRESS } = localAddresses;

describe("TasitAction.ERC721.Estate", () => {
  // Note: This test runs against an uninitialized contract.
  // TODO: Improve that test case when we move to forked from testnet blockchain.
  it("should get the Estate owner", async function() {
    const estate = new Estate(ESTATE_ADDRESS);
    let owner = await estate.owner();
    expect(owner).to.equal("0x0000000000000000000000000000000000000000");
  });
});
