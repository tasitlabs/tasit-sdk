import Estate from "./Estate";
import TasitContracts from "tasit-contracts";
const { local: localContracts } = TasitContracts;
const { EstateRegistry } = localContracts;
const { address: ESTATE_ADDRESS } = EstateRegistry;
import { accounts } from "../testHelpers/helpers";

describe("TasitAction.ERC721.Estate", () => {
  const [ownerWallet] = accounts;

  // TODO: Improve that test case when we move to forked from testnet blockchain.
  it("should get the Estate owner", async () => {
    const { address: ownerAddress } = ownerWallet;
    const estate = new Estate(ESTATE_ADDRESS);
    let owner = await estate.owner();
    expect(owner).to.equal(ownerAddress);
  });
});
