import DecentralandMarketplace from "./DecentralandMarketplace";

import { local as localAddresses } from "../../tasit-contracts/decentraland/addresses";
const { Marketplace: MARKETPLACE_ADDRESS } = localAddresses;

describe("TasitAction.DecentralandMarketplace", () => {
  it("contract shouldn't be paused", async function() {
    const marketplace = new DecentralandMarketplace(MARKETPLACE_ADDRESS);
    const isPaused = await marketplace.paused();
    expect(isPaused).to.equal(false);
  });
});
