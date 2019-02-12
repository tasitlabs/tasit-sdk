import Decentraland from "./Decentraland";

import { local as localAddresses } from "../../tasit-contracts/decentraland/addresses";
const { Marketplace: MARKETPLACE_ADDRESS } = localAddresses;

describe("TasitAction.Marketplace.Decentraland", () => {
  it("contract shouldn't be paused", async function() {
    const marketplace = new Decentraland(MARKETPLACE_ADDRESS);
    const isPaused = await marketplace.paused();
    expect(isPaused).to.equal(false);
  });
});
