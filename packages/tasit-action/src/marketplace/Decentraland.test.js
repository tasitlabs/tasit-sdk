import Decentraland from "./Decentraland";
import TasitContracts from "../../../tasit-contracts/dist";
const { local: localContracts } = TasitContracts;
const { Marketplace } = localContracts;
const { address: MARKETPLACE_ADDRESS } = Marketplace;

describe("TasitAction.Marketplace.Decentraland", () => {
  it("contract shouldn't be paused", async () => {
    const marketplace = new Decentraland(MARKETPLACE_ADDRESS);
    const isPaused = await marketplace.paused();
    expect(isPaused).to.equal(false);
  });
});
