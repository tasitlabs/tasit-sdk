import DecentralandMana from "./DecentralandMana";

import { local as localAddresses } from "../../tasit-contracts/decentraland/addresses";
const { MANAToken: MANA_ADDRESS } = localAddresses;

describe("TasitAction.DecentralandMana", () => {
  it("should get the MANAToken name", async function() {
    const mana = new DecentralandMana(MANA_ADDRESS);
    const name = await mana.name();
    expect(name).to.equal("Decentraland MANA");
  });
});
